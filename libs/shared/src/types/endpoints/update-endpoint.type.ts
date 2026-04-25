import type { RateLimitConfig } from "./rate-limit-config.type";
import type { TransformRule } from "./transform-rule.type";

export type UpdateEndpoint = {
	name?: string;
	targetUrl?: string;
	rateLimitConfig?: RateLimitConfig | null;
	transformRules?: TransformRule[] | null;
	isActive?: boolean;
};
