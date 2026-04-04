import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";

export class RateLimitConfigDto {
	@ApiProperty({
		description: "Max requests allowed in the window",
		example: 100,
	})
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(1_000_000)
	maxRequests!: number;

	@ApiProperty({ description: "Sliding window length in seconds", example: 60 })
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(86_400)
	windowSeconds!: number;
}
