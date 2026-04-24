import type { EnvironmentType } from "../types/environment.type";
import { registerAs } from "@nestjs/config";
import { ConfigKey } from "../../../common/constants/config-key.constant";

export const environmentRegister = registerAs(
	ConfigKey.Environment,
	(): EnvironmentType => {
		const nodeEnv = process.env.NODE_ENV || "";

		return {
			nodeEnv,
		};
	},
);
