import type { JwtType } from "../types/jwt.type";
import { registerAs } from "@nestjs/config";
import { configKeyConst } from "../../../common/consts/config-key.const";

export const jwtRegister = registerAs(configKeyConst.jwt, (): JwtType => {
	const secret = process.env.JWT_SECRET || "";
	const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "";
	const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "";

	return {
		secret,
		accessExpiresIn,
		refreshExpiresIn,
	};
});
