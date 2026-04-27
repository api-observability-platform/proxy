import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { paginationConst } from "../consts/pagination.const";

export class PaginationQueryDto {
	@ApiPropertyOptional({
		description: "Number of records to return (max 100)",
		default: paginationConst.defaultListLimit,
		maximum: paginationConst.maxListLimit,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(paginationConst.maxListLimit)
	limit?: number;

	@ApiPropertyOptional({
		description: "Zero-based offset for pagination",
		default: paginationConst.defaultOffset,
		minimum: paginationConst.defaultOffset,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(paginationConst.defaultOffset)
	offset?: number;
}
