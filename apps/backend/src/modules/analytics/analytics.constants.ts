export const analyticsConstants = {
	last_24HMs: 24 * 60 * 60 * 1000,
	httpStatusServerErrorThreshold: 500,
	httpStatusSuccessMin: 200,
	httpStatusSuccessMax: 300,
	defaultTimeseriesLimit: 24,
	maxTimeseriesLimit: 168,
	uptimeDivisorFallback: 1,
	isoHourBucketPrefixLength: 13,
	isoDayBucketPrefixLength: 10,
} as const;
