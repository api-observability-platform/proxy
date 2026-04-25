import type { RateLimitConfig } from "./rate-limit-config.type";
import type { TransformRule } from "./transform-rule.type";

export type CreateEndpoint = {
	name: string;
	targetUrl: string;
	rateLimitConfig?: RateLimitConfig;
	transformRules?: TransformRule[];
	isActive?: boolean;
};
