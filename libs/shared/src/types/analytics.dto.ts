export type AnalyticsSummaryDto = {
	totalRequests: number;
	requestsLast24h: number;
	avgLatencyMs: number;
	uptimePercent: number;
	errorRate: number;
};

export type AnalyticsTimeseriesPointDto = {
	bucket: string;
	requests: number;
	avgLatencyMs: number;
};

export type AnalyticsBreakdownDto = {
	byMethod: Array<{ method: string; count: number }>;
	byStatus: Array<{ status: number; count: number }>;
};
