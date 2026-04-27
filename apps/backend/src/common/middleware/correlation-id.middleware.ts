import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { Injectable, type NestMiddleware } from "@nestjs/common";
import { correlationId } from "./correlation-id.constant";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction): void {
		const incoming = req.headers[correlationId];
		const id =
			typeof incoming === "string" && incoming.length > 0
				? incoming
				: randomUUID();
		req.correlationId = id;
		res.setHeader("X-Correlation-ID", id);
		next();
	}
}
