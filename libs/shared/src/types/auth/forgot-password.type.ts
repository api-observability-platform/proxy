import type { SignInType } from "./sign-in.type";

export type ForgotPasswordType = Omit<SignInType, "password">;
