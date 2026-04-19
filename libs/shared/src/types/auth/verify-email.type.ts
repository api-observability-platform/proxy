import type { SignInType } from "./sign-in.type";

export type VerifyEmailType = Pick<SignInType, "email"> & {
	code: string;
};
