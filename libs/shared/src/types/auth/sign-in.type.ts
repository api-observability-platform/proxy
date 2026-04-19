import type { SignUpType } from "./sign-up.type";

export type SignInType = Omit<SignUpType, "name">;
