import type { AppType } from "../types/app.type";
import { registerAs } from "@nestjs/config";
import { ConfigKey } from "../../../common/constants/config-key.constant";

export const appRegister = registerAs(ConfigKey.App, (): AppType => {
	const port = Number(process.env.APP_PORT || "");
	const requestTimeout = Number(process.env.APP_REQUEST_TIMEOUT || "");
	const corsOrigin = process.env.APP_CORS_ORIGIN || "";
	const dashboardBaseUrl = corsOrigin || "";

	return {
		port,
		requestTimeout,
		corsOrigin,
		dashboardBaseUrl,
	};
});
