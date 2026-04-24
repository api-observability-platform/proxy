import { HttpStatus } from "@nestjs/common";

export const PrismaErrorMap: Record<string, HttpStatus> = {
	p2000: HttpStatus.BAD_REQUEST,
	p2001: HttpStatus.NOT_FOUND,
	p2002: HttpStatus.CONFLICT,
	p2003: HttpStatus.BAD_REQUEST,
	p2014: HttpStatus.BAD_REQUEST,
	p2025: HttpStatus.NOT_FOUND,
} as const;
