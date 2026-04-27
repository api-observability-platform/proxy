import type { AnalyticsSummary } from "@proxy-server/shared";

export class AnalyticsSummaryRdo implements AnalyticsSummary {
	totalRequests: number;
	requestsLast24h: number;
	avgLatencyMs: number;
	uptimePercent: number;
	errorRate: number;

	constructor(
		totalRequests: number,
		requestsLast24h: number,
		avgLatencyMs: number,
		uptimePercent: number,
		errorRate: number,
	) {
		this.totalRequests = totalRequests;
		this.requestsLast24h = requestsLast24h;
		this.avgLatencyMs = avgLatencyMs;
		this.uptimePercent = uptimePercent;
		this.errorRate = errorRate;
	}
}
