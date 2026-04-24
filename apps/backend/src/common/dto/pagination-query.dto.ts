import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { Pagination } from "../constants/pagination.constants";

export class PaginationQueryDto {
	@ApiPropertyOptional({
		description: "Number of records to return (max 100)",
		default: Pagination.DefaultListLimit,
		maximum: Pagination.MaxListLimit,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(Pagination.MaxListLimit)
	limit?: number;

	@ApiPropertyOptional({
		description: "Zero-based offset for pagination",
		default: Pagination.DefaultOffset,
		minimum: Pagination.DefaultOffset,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(Pagination.DefaultOffset)
	offset?: number;
}
