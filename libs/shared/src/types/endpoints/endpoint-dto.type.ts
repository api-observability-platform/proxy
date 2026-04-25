import type { RateLimitConfig } from "./rate-limit-config.type";
import type { TransformRule } from "./transform-rule.type";

export const ENDPOINT_PROTOCOLS = ["HTTP"] as const;

export type EndpointProtocol = (typeof ENDPOINT_PROTOCOLS)[number];

export type EndpointDto = {
	id: string;
	name: string;
	slug: string;
	targetUrl: string;
	protocol: EndpointProtocol;
	rateLimitConfig: RateLimitConfig | null;
	transformRules: TransformRule[] | null;
	isActive: boolean;
	createdAt: string;
};

export type EndpointListResponseDto = {
	items: EndpointDto[];
	total: number;
	limit: number;
	offset: number;
};
