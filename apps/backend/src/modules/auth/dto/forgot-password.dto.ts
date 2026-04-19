import type { ForgotPasswordType } from "@proxy-server/shared";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ForgotPasswordDto implements ForgotPasswordType {
	@ApiProperty({ example: "user@example.com" })
	@IsEmail()
	email!: string;
}
