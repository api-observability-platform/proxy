import type { VerifyEmailType } from "./verify-email.type";

export type ResetPasswordType = VerifyEmailType & {
	newPassword: string;
};
