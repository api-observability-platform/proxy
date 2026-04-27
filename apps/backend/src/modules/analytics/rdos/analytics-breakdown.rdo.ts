import type { AnalyticsBreakdown } from "@proxy-server/shared";

export class AnalyticsBreakdownRdo implements AnalyticsBreakdown {
	byMethod: Array<{ method: string; count: number }>;
	byStatus: Array<{ status: number; count: number }>;

	constructor(
		byMethod: Array<{ method: string; count: number }>,
		byStatus: Array<{ status: number; count: number }>,
	) {
		this.byMethod = byMethod;
		this.byStatus = byStatus;
	}
}
