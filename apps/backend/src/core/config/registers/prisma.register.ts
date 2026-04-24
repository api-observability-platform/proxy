import type { PrismaType } from "../types/prisma.type.js";
import { registerAs } from "@nestjs/config";
import { ConfigKey } from "../../../common/constants/config-key.constant.js";

export const prismaRegister = registerAs(ConfigKey.Prisma, (): PrismaType => {
	const url = process.env.POSTGRES_URL || "";

	return {
		url,
	};
});
