import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsUUID } from "class-validator";

export class CreateReportScheduleDto {
	@ApiProperty({ format: "uuid" })
	@IsUUID()
	channelId!: string;

	@ApiProperty({ enum: ["DAILY", "WEEKLY"] })
	@IsIn(["DAILY", "WEEKLY"])
	frequency!: "DAILY" | "WEEKLY";
}
