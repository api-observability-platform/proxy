export type AnalyticsBreakdown = {
	byMethod: Array<{ method: string; count: number }>;
	byStatus: Array<{ status: number; count: number }>;
};
