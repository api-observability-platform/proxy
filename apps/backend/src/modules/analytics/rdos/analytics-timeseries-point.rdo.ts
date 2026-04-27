import type { AnalyticsTimeseriesPoint } from "@proxy-server/shared";

export class AnalyticsTimeseriesPointRdo implements AnalyticsTimeseriesPoint {
	bucket: string;
	requests: number;
	avgLatencyMs: number;

	constructor(bucket: string, requests: number, avgLatencyMs: number) {
		this.bucket = bucket;
		this.requests = requests;
		this.avgLatencyMs = avgLatencyMs;
	}
}
