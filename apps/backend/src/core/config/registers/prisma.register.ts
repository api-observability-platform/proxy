import type { PrismaType } from "../types/prisma.type.js";
import { registerAs } from "@nestjs/config";
import { configKeyConst } from "../../../common/consts/config-key.const.js";

export const prismaRegister = registerAs(
	configKeyConst.prisma,
	(): PrismaType => {
		const url = process.env.POSTGRES_URL || "";

		return {
			url,
		};
	},
);
