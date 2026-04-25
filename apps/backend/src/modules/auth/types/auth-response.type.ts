import type { UserDto } from "../../../common/types/current-user-payload.type";

export type AuthResponseType = {
	accessToken: string;
	user: UserDto;
};
