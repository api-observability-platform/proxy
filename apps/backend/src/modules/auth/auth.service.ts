import type {
	ForgotPassword,
	ResendVerification,
	ResetPassword,
	SignIn,
	SignUp,
	VerifyEmail,
} from "@proxy-server/shared";
import type { CurrentUserPayload } from "../../common/types/current-user-payload.type";
import type { AuthResponseType } from "./types/auth-response.type";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Inject,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { EmailService } from "../../core/email/email.service";
import { PrismaService } from "../../core/prisma/prisma.service";
import { authConstants } from "./auth.constants";
import { PasswordResetService } from "./password-reset.service";
import { TokenService } from "./token.service";
import { generateSixDigitCode } from "./utils/auth-code.util";

@Injectable()
export class AuthService {
	constructor(
		@Inject(PrismaService) private readonly prismaService: PrismaService,
		@Inject(EmailService) private readonly emailService: EmailService,
		@Inject(TokenService) private readonly tokenService: TokenService,
		@Inject(PasswordResetService)
		private readonly passwordResetService: PasswordResetService,
	) {}

	async signUp(signUp: SignUp): Promise<{ message: string }> {
		const user = await this.prismaService.user.findUnique({
			where: { email: signUp.email },
		});
		if (user) {
			throw new ConflictException("User with this email already exists");
		}
		const passwordHash = await bcrypt.hash(
			signUp.password,
			authConstants.crypto.saltRounds,
		);
		const plainCode = generateSixDigitCode();
		const verificationCodeHash = await bcrypt.hash(
			plainCode,
			authConstants.crypto.saltRounds,
		);
		const verificationExpiresAt = new Date(
			Date.now() + authConstants.crypto.codeTtlMs,
		);
		await this.prismaService.user.create({
			data: {
				email: signUp.email,
				passwordHash,
				name: signUp.name || null,
				isEmailVerified: false,
				verificationCodeHash,
				verificationExpiresAt,
			},
		});
		await this.emailService.sendVerificationCode(signUp.email, plainCode);
		return {
			message:
				"Registration successful. Check your email for a verification code.",
		};
	}

	async verifyEmail(
		verifyEmail: VerifyEmail,
	): Promise<AuthResponseType & { refreshToken: string }> {
		const user = await this.prismaService.user.findUnique({
			where: { email: verifyEmail.email },
		});
		if (!user) {
			throw new UnauthorizedException("Invalid email or code");
		}
		if (user.isEmailVerified) {
			throw new BadRequestException("Email is already verified");
		}
		if (
			!user.verificationCodeHash ||
			!user.verificationExpiresAt ||
			user.verificationExpiresAt < new Date()
		) {
			throw new UnauthorizedException("Invalid or expired verification code");
		}
		const passwordsMatched = await bcrypt.compare(
			verifyEmail.code,
			user.verificationCodeHash,
		);
		if (passwordsMatched) {
			throw new UnauthorizedException("Invalid or expired verification code");
		}
		await this.prismaService.user.update({
			where: { id: user.id },
			data: {
				isEmailVerified: true,
				verificationCodeHash: null,
				verificationExpiresAt: null,
			},
		});
		return this.tokenService.issueTokensForUserId(user.id);
	}

	async resendVerification(
		resendVerification: ResendVerification,
	): Promise<{ message: string }> {
		const user = await this.prismaService.user.findUnique({
			where: { email: resendVerification.email },
		});
		if (!user) {
			return { message: "If an account exists, a code was sent." };
		}
		if (user.isEmailVerified) {
			throw new BadRequestException("Email is already verified");
		}
		const plainCode = generateSixDigitCode();
		const verificationCodeHash = await bcrypt.hash(
			plainCode,
			authConstants.crypto.saltRounds,
		);
		await this.prismaService.user.update({
			where: { id: user.id },
			data: {
				verificationCodeHash,
				verificationExpiresAt: new Date(
					Date.now() + authConstants.crypto.codeTtlMs,
				),
			},
		});
		await this.emailService.sendVerificationCode(
			resendVerification.email,
			plainCode,
		);
		return { message: "If an account exists, a code was sent." };
	}

	async signIn(
		signIn: SignIn,
	): Promise<AuthResponseType & { refreshToken: string }> {
		const user = await this.prismaService.user.findUnique({
			where: { email: signIn.email },
		});
		if (!user) {
			throw new UnauthorizedException("Invalid email or password");
		}
		const passwordsMatched = await bcrypt.compare(
			signIn.password,
			user.passwordHash,
		);
		if (!passwordsMatched) {
			throw new UnauthorizedException("Invalid email or password");
		}
		if (!user.isEmailVerified) {
			throw new ForbiddenException(
				"Please verify your email before signing in.",
			);
		}
		return this.tokenService.issueTokensForUserId(user.id);
	}

	async validateUserById(
		userId: string,
	): Promise<{ id: string; email: string; name: string | null } | null> {
		return this.prismaService.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true, name: true },
		});
	}
	async me(userId: string): Promise<CurrentUserPayload> {
		const user = await this.validateUserById(userId);
		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}

	async validateRefreshToken(rawToken: string): Promise<{
		tokenId: string;
		user: CurrentUserPayload;
	}> {
		return this.tokenService.validateRefreshToken(rawToken);
	}

	async rotateRefreshToken(
		rawToken: string,
	): Promise<AuthResponseType & { refreshToken: string }> {
		return this.tokenService.rotateRefreshToken(rawToken);
	}

	async logout(rawToken: string | undefined): Promise<void> {
		return this.tokenService.logout(rawToken);
	}

	async forgotPassword(
		forgotPassword: ForgotPassword,
	): Promise<{ message: string }> {
		return this.passwordResetService.forgotPassword(forgotPassword.email);
	}

	async resetPassword(
		resetPassword: ResetPassword,
	): Promise<{ message: string }> {
		return this.passwordResetService.resetPassword(
			resetPassword.email,
			resetPassword.code,
			resetPassword.newPassword,
		);
	}
}
