import type { Request, Response } from "express";
import type { CurrentUserPayload } from "../../common/types/current-user-payload.type";
import type { EnvironmentType } from "../../core/config/types/environment.type";
import type { JwtType } from "../../core/config/types/jwt.type";
import type { AuthResponseType } from "./types/auth-response.type";
import type { RequestWithRefreshAuthType } from "./types/request-with-refresh-auth.type";
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiExtraModels,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiTooManyRequestsResponse,
	ApiUnauthorizedResponse,
	getSchemaPath,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { configKeyConst } from "../../common/consts/config-key.const";
import { environmentsConst } from "../../common/consts/environments.const";
import { CurrentUserDecorator } from "../../common/decorators/current-user.decorator";
import { PublicDecorator } from "../../common/decorators/public.decorator";
import { AuthResponseSchema } from "../../common/swagger/schemas/auth-response.schema";
import { AuthUserSchema } from "../../common/swagger/schemas/auth-user.schema";
import { ErrorResponseSchema } from "../../common/swagger/schemas/error-response.schema";
import { LogoutResponseSchema } from "../../common/swagger/schemas/logout-response.schema";
import { MessageResponseSchema } from "../../common/swagger/schemas/message-response.schema";
import { authConstants } from "./auth.constants";
import { AuthService } from "./auth.service";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { ResendVerificationDto } from "./dtos/resend-verification.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import { SignInDto } from "./dtos/sign-in.dto";
import { SignUpDto } from "./dtos/sign-up.dto";
import { VerifyEmailDto } from "./dtos/verify-email.dto";
import { RefreshAuthGuard } from "./guards/refresh-auth.guard";
import { parseDurationToMs } from "./utils/duration.util";

@ApiTags("Auth")
@ApiExtraModels(
	AuthResponseSchema,
	AuthUserSchema,
	ErrorResponseSchema,
	LogoutResponseSchema,
	MessageResponseSchema,
)
@Controller("auth")
export class AuthController {
	private readonly isProduction: boolean;
	private readonly refreshExpiresIn: string;

	constructor(
		@Inject(AuthService) private readonly authService: AuthService,
		@Inject(ConfigService) readonly configService: ConfigService,
	) {
		const { nodeEnv } = configService.getOrThrow<EnvironmentType>(
			configKeyConst.environment,
		);
		this.isProduction = nodeEnv === environmentsConst.production;
		const { refreshExpiresIn } = configService.getOrThrow<JwtType>(
			configKeyConst.jwt,
		);
		this.refreshExpiresIn = refreshExpiresIn;
	}

	private refreshCookieMaxAgeMs(): number {
		return parseDurationToMs(this.refreshExpiresIn);
	}

	private setRefreshCookie(res: Response, rawRefresh: string): void {
		res.cookie(authConstants.refresh.cookieName, rawRefresh, {
			httpOnly: true,
			secure: this.isProduction,
			sameSite: "lax",
			path: "/",
			maxAge: this.refreshCookieMaxAgeMs(),
		});
	}

	private clearRefreshCookie(res: Response): void {
		res.clearCookie(authConstants.refresh.cookieName, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: this.isProduction,
		});
	}

	private bodyAuth(
		res: Response,
		result: AuthResponseType & { refreshToken: string },
	): AuthResponseType {
		this.setRefreshCookie(res, result.refreshToken);
		return {
			accessToken: result.accessToken,
			user: result.user,
		};
	}

	@PublicDecorator()
	@Throttle({
		default: {
			limit: authConstants.throttle.signUp.limit,
			ttl: authConstants.throttle.signUp.ttlMs,
		},
	})
	@HttpCode(HttpStatus.CREATED)
	@Post("sign-up")
	@ApiBody({ type: SignUpDto })
	@ApiOperation({
		summary: "Register a new user.",
		description:
			"Creates an unverified account, hashes the password, stores a time-limited verification code (hashed), and sends a 6-digit code by email. Does not return tokens; call **verify-email** after checking the inbox. Rate limited.",
		security: [],
	})
	@ApiCreatedResponse({
		description:
			"Account created. Response body contains only a **message**; no tokens.",
		schema: { $ref: getSchemaPath(MessageResponseSchema) },
	})
	@ApiBadRequestResponse({
		description:
			"Validation failed (e.g. invalid email, password shorter than 8 characters).",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	@ApiConflictResponse({
		description: "Email is already registered.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	@ApiTooManyRequestsResponse({
		description: "Rate limit exceeded for this endpoint.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	@ApiInternalServerErrorResponse({
		description: "Unexpected server error while creating the user.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	signUp(@Body() signUpDto: SignUpDto): Promise<{ message: string }> {
		return this.authService.signUp(signUpDto);
	}

	@PublicDecorator()
	@Throttle({
		default: {
			limit: authConstants.throttle.verifyEmail.limit,
			ttl: authConstants.throttle.verifyEmail.ttlMs,
		},
	})
	@HttpCode(HttpStatus.OK)
	@Post("verify-email")
	@ApiBody({ type: VerifyEmailDto })
	@ApiOperation({
		summary: "Verify email with 6-digit code.",
		description:
			"Confirms ownership of the email using the code from sign-up. On success, returns **accessToken** and **user** in the JSON body and sets the **refresh_token** httpOnly cookie (rotating refresh sessions use the same cookie name). Rate limited.",
		security: [],
	})
	@ApiOkResponse({
		description:
			"Email verified. **accessToken** and **user** in body; **refresh_token** cookie set.",
		schema: { $ref: getSchemaPath(AuthResponseSchema) },
	})
	@ApiBadRequestResponse({
		description: "Email is already verified.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	@ApiUnauthorizedResponse({
		description: "Unknown email, wrong or expired code, or missing code data.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	async verifyEmail(
		@Body() verifyEmailDto: VerifyEmailDto,
		@Res({ passthrough: true }) res: Response,
	): Promise<AuthResponseType> {
		const result = await this.authService.verifyEmail(verifyEmailDto);
		return this.bodyAuth(res, result);
	}

	@PublicDecorator()
	@Throttle({
		default: {
			limit: authConstants.throttle.resendVerification.limit,
			ttl: authConstants.throttle.resendVerification.ttlMs,
		},
	})
	@HttpCode(HttpStatus.OK)
	@Post("resend-verification")
	@ApiBody({ type: ResendVerificationDto })
	@ApiOperation({
		summary: "Resend verification code.",
		description:
			"If the account exists and is still unverified, generates a new code and emails it. Response is always a generic **message** to avoid email enumeration. Rate limited.",
		security: [],
	})
	@ApiOkResponse({
		description:
			"Generic success **message** (whether or not an email was sent).",
		schema: { $ref: getSchemaPath(MessageResponseSchema) },
	})
	@ApiBadRequestResponse({
		description: "Email is already verified.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	@ApiTooManyRequestsResponse({
		description: "Rate limit exceeded for this endpoint.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	resendVerification(
		@Body() resendVerificationDto: ResendVerificationDto,
	): Promise<{ message: string }> {
		return this.authService.resendVerification(resendVerificationDto);
	}

	@PublicDecorator()
	@Throttle({
		default: {
			limit: authConstants.throttle.signIn.limit,
			ttl: authConstants.throttle.signIn.ttlMs,
		},
	})
	@HttpCode(HttpStatus.OK)
	@Post("sign-in")
	@ApiBody({ type: SignInDto })
	@ApiOperation({
		summary: "Authenticate user.",
		description:
			"Requires a **verified** email. Returns **accessToken** and **user** in the JSON body and sets the **refresh_token** httpOnly, **Secure** (in production), **SameSite=Lax** cookie. Rate limited.",
		security: [],
	})
	@ApiOkResponse({
		description:
			"Authenticated. **accessToken** and **user** in body; **refresh_token** cookie set.",
		schema: { $ref: getSchemaPath(AuthResponseSchema) },
	})
	@ApiBadRequestResponse({
		description: "Validation failed (e.g. missing password).",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	@ApiUnauthorizedResponse({
		description: "Wrong email or password.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	@ApiForbiddenResponse({
		description: "Email exists but is not verified yet.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	@ApiTooManyRequestsResponse({
		description: "Rate limit exceeded for this endpoint.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	@ApiInternalServerErrorResponse({
		description: "Unexpected server error during sign-in.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	async signIn(
		@Body() signInDto: SignInDto,
		@Res({ passthrough: true }) res: Response,
	): Promise<AuthResponseType> {
		const result = await this.authService.signIn(signInDto);
		return this.bodyAuth(res, result);
	}

	@PublicDecorator()
	@Throttle({
		default: {
			limit: authConstants.throttle.forgotPassword.limit,
			ttl: authConstants.throttle.forgotPassword.ttlMs,
		},
	})
	@HttpCode(HttpStatus.OK)
	@Post("forgot-password")
	@ApiBody({ type: ForgotPasswordDto })
	@ApiOperation({
		summary: "Request password reset code.",
		description:
			"If the account exists, stores a time-limited reset code (hashed) and emails a 6-digit code. Response is always a generic **message** to avoid email enumeration. Rate limited.",
		security: [],
	})
	@ApiOkResponse({
		description:
			"Generic **message** (no indication whether the email exists).",
		schema: { $ref: getSchemaPath(MessageResponseSchema) },
	})
	@ApiBadRequestResponse({
		description: "Validation failed (e.g. invalid email).",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	@ApiTooManyRequestsResponse({
		description: "Rate limit exceeded for this endpoint.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	forgotPassword(
		@Body() forgotPasswordDto: ForgotPasswordDto,
	): Promise<{ message: string }> {
		return this.authService.forgotPassword(forgotPasswordDto);
	}

	@PublicDecorator()
	@Throttle({
		default: {
			limit: authConstants.throttle.resetPassword.limit,
			ttl: authConstants.throttle.resetPassword.ttlMs,
		},
	})
	@HttpCode(HttpStatus.OK)
	@Post("reset-password")
	@ApiBody({ type: ResetPasswordDto })
	@ApiOperation({
		summary: "Reset password with code.",
		description:
			"Validates the 6-digit code, sets a new password, clears reset fields, and revokes all refresh tokens for the user. Does not set a new session cookie; sign in again after reset. Rate limited.",
		security: [],
	})
	@ApiOkResponse({
		description:
			"Password updated. Generic **message**; sign in to obtain new tokens.",
		schema: { $ref: getSchemaPath(MessageResponseSchema) },
	})
	@ApiBadRequestResponse({
		description:
			"Validation failed (e.g. password too short, invalid code format).",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	@ApiUnauthorizedResponse({
		description: "Unknown email, wrong code, or expired reset code.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	@ApiTooManyRequestsResponse({
		description: "Rate limit exceeded for this endpoint.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	resetPassword(
		@Body() resetPasswordDto: ResetPasswordDto,
	): Promise<{ message: string }> {
		return this.authService.resetPassword(resetPasswordDto);
	}

	@PublicDecorator()
	@UseGuards(RefreshAuthGuard)
	@HttpCode(HttpStatus.OK)
	@Post("refresh")
	@ApiOperation({
		summary: "Refresh access token.",
		description:
			"Reads the **refresh_token** httpOnly cookie, validates the session, **revokes** the previous refresh token, issues a new pair, and sets a fresh **refresh_token** cookie. No `Authorization` header required. Not rate-limited at the application layer.",
		security: [],
	})
	@ApiOkResponse({
		description:
			"New **accessToken** and **user** in body; new **refresh_token** cookie.",
		schema: { $ref: getSchemaPath(AuthResponseSchema) },
	})
	@ApiUnauthorizedResponse({
		description:
			"Missing cookie, invalid or revoked token, expired session, or unverified email on record.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	async refresh(
		@Req() req: Request & RequestWithRefreshAuthType,
		@Res({ passthrough: true }) res: Response,
	): Promise<AuthResponseType> {
		const raw = req.refreshAuth?.rawRefreshToken;
		if (!raw) {
			throw new UnauthorizedException("Invalid session");
		}
		const result = await this.authService.rotateRefreshToken(raw);
		return this.bodyAuth(res, result);
	}

	@HttpCode(HttpStatus.OK)
	@Post("logout")
	@ApiBearerAuth("Bearer")
	@ApiOperation({
		summary: "Revoke refresh session.",
		description:
			"Requires a valid **Bearer** access token (global JWT guard). Revokes the refresh token identified by the **refresh_token** cookie (if present) and clears that cookie. Idempotent if the cookie is already absent.",
	})
	@ApiOkResponse({
		description:
			"Session revoked. Body is **{ success: true }**; refresh cookie cleared.",
		schema: { $ref: getSchemaPath(LogoutResponseSchema) },
	})
	@ApiUnauthorizedResponse({
		description: "Missing or invalid access token.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	async logout(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<{ success: boolean }> {
		const raw = req.cookies?.[authConstants.refresh.cookieName] as
			| string
			| undefined;
		await this.authService.logout(raw);
		this.clearRefreshCookie(res);
		return { success: true };
	}

	@Get("me")
	@ApiBearerAuth("Bearer")
	@ApiOperation({
		summary: "Current user.",
		description:
			"Returns the authenticated user (**id**, **email**, **name**) from the database using the **Bearer** access token subject. Fails if the user was deleted after the token was issued.",
	})
	@ApiOkResponse({
		description: "Current user profile (**id**, **email**, **name**).",
		schema: { $ref: getSchemaPath(AuthUserSchema) },
	})
	@ApiUnauthorizedResponse({
		description:
			"Missing, invalid, or expired access token; or user no longer exists.",
		schema: { $ref: getSchemaPath(ErrorResponseSchema) },
	})
	me(
		@CurrentUserDecorator() user: CurrentUserPayload,
	): Promise<CurrentUserPayload> {
		return this.authService.me(user.id);
	}
}
