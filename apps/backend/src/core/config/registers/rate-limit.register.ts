import type { RateLimitType } from "../types/rate-limiting.type";
import { registerAs } from "@nestjs/config";
import { ConfigKey } from "../../../common/constants/config-key.constant";

export const rateLimitRegister = registerAs(
	ConfigKey.RateLimit,
	(): RateLimitType => {
		const ttl = Number(process.env.THROTTLE_TTL_MS || "");
		const limit = Number(process.env.THROTTLE_LIMIT || "");

		return {
			ttl,
			limit,
		};
	},
);
