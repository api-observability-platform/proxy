import type { RateLimitType } from "../config/types/rate-limiting.type";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import {
	ThrottlerModule as CoreThrottlerModule,
	ThrottlerGuard,
} from "@nestjs/throttler";
import { ConfigKey } from "../../common/constants/config-key.constant";
import { ConfigModule } from "../config/config.module";

@Module({
	imports: [
		CoreThrottlerModule.forRootAsync({
			inject: [ConfigService],
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => {
				const { ttl, limit } = configService.getOrThrow<RateLimitType>(
					ConfigKey.RateLimit,
				);

				return [
					{
						name: "default",
						ttl,
						limit,
					},
				];
			},
		}),
	],
	providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class RateLimitModule {}
