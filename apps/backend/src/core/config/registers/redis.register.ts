import type { RedisType } from "../types/redis.type";
import { registerAs } from "@nestjs/config";
import { ConfigKey } from "../../../common/constants/config-key.constant";

export const redisRegister = registerAs(ConfigKey.Redis, (): RedisType => {
	const url = process.env.REDIS_URL || "";

	return { url };
});
