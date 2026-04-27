import type { RateLimitType } from "../types/rate-limit.type";
import { registerAs } from "@nestjs/config";
import { configKeyConst } from "../../../common/consts/config-key.const";

export const rateLimitRegister = registerAs(
	configKeyConst.rateLimit,
	(): RateLimitType => {
		const ttl = Number(process.env.THROTTLE_TTL_MS || "");
		const limit = Number(process.env.THROTTLE_LIMIT || "");

		return {
			ttl,
			limit,
		};
	},
);
