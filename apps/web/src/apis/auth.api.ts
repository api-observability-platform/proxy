import type {
	ForgotPasswordType,
	ResendVerificationType,
	ResetPasswordType,
	SignInType,
	SignUpType,
	UserDto,
	VerifyEmailType,
} from "@proxy-server/shared";
import { toApiUrl } from "./helpers/api-url.helper";
import { type HttpClient, httpClient } from "./helpers/http-client";

export class AuthApi {
	constructor(private readonly http: HttpClient) {}

	signUp(data: SignUpType) {
		return this.http.request<{ message: string }>("/auth/sign-up", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	signIn(data: SignInType) {
		return this.http.request<{ accessToken: string; user: UserDto }>(
			"/auth/sign-in",
			{
				method: "POST",
				body: JSON.stringify(data),
			},
		);
	}

	verifyEmail(data: VerifyEmailType) {
		return this.http.request<{ accessToken: string; user: UserDto }>(
			"/auth/verify-email",
			{
				method: "POST",
				body: JSON.stringify(data),
			},
		);
	}

	resendVerification(data: ResendVerificationType) {
		return this.http.request<{ message: string }>("/auth/resend-verification", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	forgotPassword(data: ForgotPasswordType) {
		return this.http.request<{ message: string }>("/auth/forgot-password", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	resetPassword(data: ResetPasswordType) {
		return this.http.request<{ message: string }>("/auth/reset-password", {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	me() {
		return this.http.request<UserDto>("/auth/me");
	}

	async logout(accessToken: string | null) {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};
		if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
		await fetch(toApiUrl("/auth/logout"), {
			method: "POST",
			credentials: "include",
			headers,
		});
	}
}

export const authApi = new AuthApi(httpClient);
