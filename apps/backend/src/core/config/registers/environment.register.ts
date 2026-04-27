import type { EnvironmentType } from "../types/environment.type";
import { registerAs } from "@nestjs/config";
import { configKeyConst } from "../../../common/consts/config-key.const";

export const environmentRegister = registerAs(
	configKeyConst.environment,
	(): EnvironmentType => {
		const nodeEnv = process.env.NODE_ENV || "";

		return {
			nodeEnv,
		};
	},
);
