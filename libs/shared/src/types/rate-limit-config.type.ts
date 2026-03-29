/** Per-endpoint rate limit window (stored as JSON on `Endpoint`). */
export type RateLimitConfig = {
	maxRequests: number;
	windowSeconds: number;
};
