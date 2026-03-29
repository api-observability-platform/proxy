import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsString, MinLength, ValidateIf } from "class-validator";

/** Validated transform rule for proxy traffic. */
export class TransformRuleDto {
	@ApiProperty({
		enum: ["ADD_HEADER", "REMOVE_HEADER", "REWRITE_PATH", "SET_BODY"],
	})
	@IsString()
	@IsIn(["ADD_HEADER", "REMOVE_HEADER", "REWRITE_PATH", "SET_BODY"])
	type!: "ADD_HEADER" | "REMOVE_HEADER" | "REWRITE_PATH" | "SET_BODY";

	@ApiProperty({ required: false, enum: ["request", "response"] })
	@ValidateIf(
		(o: TransformRuleDto) =>
			o.type === "ADD_HEADER" ||
			o.type === "REMOVE_HEADER" ||
			o.type === "SET_BODY",
	)
	@IsIn(["request", "response"])
	phase?: "request" | "response";

	@ApiProperty({ required: false, description: "Header name" })
	@ValidateIf(
		(o: TransformRuleDto) =>
			o.type === "ADD_HEADER" || o.type === "REMOVE_HEADER",
	)
	@IsString()
	@MinLength(1)
	name?: string;

	@ApiProperty({ required: false })
	@ValidateIf((o: TransformRuleDto) => o.type === "ADD_HEADER")
	@IsString()
	value?: string;

	@ApiProperty({ required: false })
	@ValidateIf((o: TransformRuleDto) => o.type === "REWRITE_PATH")
	@IsString()
	@MinLength(1)
	pattern?: string;

	@ApiProperty({ required: false })
	@ValidateIf((o: TransformRuleDto) => o.type === "REWRITE_PATH")
	@IsString()
	replacement?: string;

	@ApiProperty({ required: false })
	@ValidateIf((o: TransformRuleDto) => o.type === "SET_BODY")
	@IsString()
	template?: string;
}
