import type { ResendVerificationType } from "@proxy-server/shared";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ResendVerificationDto implements ResendVerificationType {
	@ApiProperty({ example: "user@example.com" })
	@IsEmail()
	email!: string;
}
