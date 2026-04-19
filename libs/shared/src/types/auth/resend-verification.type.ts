import type { SignInType } from "./sign-in.type";

export type ResendVerificationType = Omit<SignInType, "password">;
