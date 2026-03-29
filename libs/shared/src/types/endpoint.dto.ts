import type { EndpointProtocol } from "./endpoint-protocol.type";
import type { RateLimitConfig } from "./rate-limit-config.type";
import type { TransformRule } from "./transform-rule.type";

/** API representation of a proxy endpoint (safe fields only). */
export type EndpointDto = {
	id: string;
	name: string;
	slug: string;
	targetUrl: string;
	protocol: EndpointProtocol;
	rateLimitConfig: RateLimitConfig | null;
	transformRules: TransformRule[] | null;
	tcpProxyPort: number | null;
	isActive: boolean;
	createdAt: string;
};

/** Paginated list of endpoints returned by `GET /endpoints`. */
export type EndpointListResponseDto = {
	items: EndpointDto[];
	total: number;
	limit: number;
	offset: number;
};
