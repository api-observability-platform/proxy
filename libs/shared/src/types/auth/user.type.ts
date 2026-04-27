import type { SignUp } from "./sign-up.type";

export type User = Pick<SignUp, "email" | "name"> & {
	id: string;
};
