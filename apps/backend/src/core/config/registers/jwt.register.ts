import type { JwtType } from "../types/jwt.type";
import { registerAs } from "@nestjs/config";
import { ConfigKey } from "../../../common/constants/config-key.constant";

export const jwtRegister = registerAs(ConfigKey.Jwt, (): JwtType => {
	const secret = process.env.JWT_SECRET || "";
	const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "";
	const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "";

	return {
		secret,
		accessExpiresIn,
		refreshExpiresIn,
	};
});
