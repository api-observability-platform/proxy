import type { Endpoint } from "@prisma/generated/client";
import type { Prisma } from "@prisma/generated/client";
import type { NextFunction, Request, Response } from "express";

/** Mutable header bag forwarded through the proxy pipeline. */
export type HeadersRecord = Record<string, string | string[] | undefined>;

/** Context passed to protocol handlers for a single proxied request. */
export type ProxyContext = {
	req: Request;
	res: Response;
	next: NextFunction;
	endpoint: Endpoint;
	path: string;
	queryString: string;
	requestBody: Buffer | null;
	headers: HeadersRecord;
	targetUrl: string;
	startTime: number;
	/** Optional metadata merged into `RequestLog.metadata` (e.g. GraphQL). */
	logMetadata?: Prisma.InputJsonValue | null;
	/** Optional enricher using truncated response body after a successful upstream response. */
	appendMetadata?: (info: {
		responseStatus: number;
		responseBodyTruncated: string | null;
	}) => Record<string, unknown> | null;
};
