import type { Prisma } from "@prisma/generated/client.js";
import type { Request } from "express";
import type { EnvironmentType } from "../../core/config/types/environment.type.js";
import type { ErrorResponseBody } from "../types/error-response-body.type.js";
import type { HttpExceptionResponse } from "../types/http-exception-response.type.js";
import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
	Inject,
	Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpAdapterHost } from "@nestjs/core";
import { configKeyConst } from "../consts/config-key.const.js";
import { environmentsConst } from "../consts/environments.const.js";
import { internalErrorMessageConst } from "./consts/internal-error-message.constant.js";
import { internalErrorTypeConst } from "./consts/internal-error-type.constant.js";
import { prismaErrorMapConst } from "./consts/prisma-error-map.constant.js";

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
	private readonly logger = new Logger(CatchEverythingFilter.name);
	private readonly isProduction: boolean;

	constructor(
		@Inject(HttpAdapterHost) private readonly httpAdapterHost: HttpAdapterHost,
		@Inject(ConfigService) readonly configService: ConfigService,
	) {
		const { nodeEnv } = configService.getOrThrow<EnvironmentType>(
			configKeyConst.environment,
		);

		this.isProduction = nodeEnv === environmentsConst.production;
	}

	catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		const request = ctx.getRequest<Request>();
		const { statusCode, error, message } = this.normalizeException(exception);
		const path = httpAdapter.getRequestUrl(request);
		const responseBody: ErrorResponseBody = {
			error,
			message,
			path,
			statusCode,
			timestamp: new Date().toISOString(),
		};
		if (statusCode >= 500) {
			const logCtx = {
				msg: "unhandled_server_error",
				statusCode,
				path,
				correlationId: request.correlationId ?? null,
				errorSummary: String(exception),
			};
			this.logger.error(
				JSON.stringify(logCtx),
				exception instanceof Error ? exception.stack : undefined,
			);
		}
		httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
	}

	private normalizeException(exception: unknown): {
		statusCode: number;
		error: string;
		message: string | string[];
	} {
		if (exception instanceof HttpException) {
			return this.normalizeHttpException(exception);
		}
		if (this.isPrismaKnownRequestError(exception)) {
			return this.normalizePrismaKnownRequestError(exception);
		}
		if (this.isPrismaValidationError(exception)) {
			return this.normalizePrismaValidationError(exception);
		}
		return this.normalizeUnknownError(exception);
	}

	private normalizeHttpException(exception: HttpException): {
		statusCode: number;
		error: string;
		message: string | string[];
	} {
		const statusCode = exception.getStatus();
		const response = exception.getResponse() as HttpExceptionResponse;
		if (typeof response === "string") {
			return {
				error: exception.name,
				message: response,
				statusCode,
			};
		}
		const message = response?.message ?? exception.message;
		const error = response?.error ?? exception.name;
		return {
			error: typeof error === "string" ? error : "Error",
			message: Array.isArray(message)
				? message
				: String(message ?? internalErrorMessageConst),
			statusCode: response?.statusCode ?? statusCode,
		};
	}

	private normalizePrismaKnownRequestError(
		error: Prisma.PrismaClientKnownRequestError,
	): {
		statusCode: number;
		error: string;
		message: string | string[];
	} {
		const statusCode =
			prismaErrorMapConst[error.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
		const message = this.getPrismaErrorMessage(error);
		return {
			error: "PrismaClientKnownRequestError",
			message,
			statusCode,
		};
	}

	private normalizePrismaValidationError(
		error: Prisma.PrismaClientValidationError,
	): {
		statusCode: number;
		error: string;
		message: string | string[];
	} {
		const message = this.isProduction ? "Validation failed" : error.message;
		return {
			error: "PrismaClientValidationError",
			message,
			statusCode: HttpStatus.BAD_REQUEST,
		};
	}

	private normalizeUnknownError(exception: unknown): {
		statusCode: number;
		error: string;
		message: string | string[];
	} {
		return {
			error: internalErrorTypeConst,
			message: this.isProduction
				? internalErrorMessageConst
				: exception instanceof Error
					? exception.message
					: String(exception),
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
		};
	}

	private getPrismaErrorMessage(
		error: Prisma.PrismaClientKnownRequestError,
	): string {
		if (error.code === "P2002") {
			const target = (error.meta?.target as string[] | undefined)?.[0];
			return target
				? `Unique constraint failed on field: ${target}`
				: error.message;
		}
		if (error.code === "P2025") {
			const modelName = error.meta?.modelName;
			return modelName
				? `${String(modelName)} record not found`
				: "Record not found";
		}
		return error.message;
	}

	private isPrismaKnownRequestError(
		exception: unknown,
	): exception is Prisma.PrismaClientKnownRequestError {
		return (
			typeof exception === "object" &&
			exception !== null &&
			"code" in exception &&
			typeof (exception as Prisma.PrismaClientKnownRequestError).code ===
				"string" &&
			(exception as Prisma.PrismaClientKnownRequestError).code.startsWith("P")
		);
	}

	private isPrismaValidationError(
		exception: unknown,
	): exception is Prisma.PrismaClientValidationError {
		return (
			exception instanceof Error &&
			exception.constructor.name === "PrismaClientValidationError"
		);
	}
}
