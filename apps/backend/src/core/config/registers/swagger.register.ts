import type { SwaggerType } from "../types/swagger.type";
import { registerAs } from "@nestjs/config";
import { ConfigKey } from "../../../common/constants/config-key.constant";

export const swaggerRegister = registerAs(
	ConfigKey.Swagger,
	(): SwaggerType => {
		const path = process.env.SWAGGER_PATH || "";
		const name = process.env.SWAGGER_NAME || "";
		const descr = process.env.SWAGGER_DESCR || "";
		const siteTitle = process.env.SWAGGER_SITE_TITLE || "";

		return {
			path,
			name,
			descr,
			siteTitle,
		};
	},
);
