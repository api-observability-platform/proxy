import type { User } from "../../../common/types/current-user-payload.type";

export type AuthResponseType = {
	accessToken: string;
	user: User;
};
