import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsUUID } from "class-validator";

/** Creates a digest schedule bound to a notification channel. */
export class CreateReportScheduleDto {
	@ApiProperty({ format: "uuid" })
	@IsUUID()
	channelId!: string;

	@ApiProperty({ enum: ["DAILY", "WEEKLY"] })
	@IsIn(["DAILY", "WEEKLY"])
	frequency!: "DAILY" | "WEEKLY";
}
