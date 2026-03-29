export type AppType = {
	appPort: number;
	appRequestTimeout: number;
	/** Comma-separated origins for CORS (e.g. http://localhost:5173) */
	corsOrigins: string[];
	/** Base URL for dashboard links in alerts (defaults to first CORS origin). */
	dashboardBaseUrl: string;
};
