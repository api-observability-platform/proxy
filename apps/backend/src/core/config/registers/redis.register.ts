import type { RedisType } from "../types/redis.type";
import { registerAs } from "@nestjs/config";
import { configKeyConst } from "../../../common/consts/config-key.const";

export const redisRegister = registerAs(configKeyConst.redis, (): RedisType => {
	const url = process.env.REDIS_URL || "";

	return { url };
});
