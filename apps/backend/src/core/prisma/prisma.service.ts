import type { PrismaType } from "../config/types/prisma.type";
import {
	Inject,
	Injectable,
	type OnModuleDestroy,
	type OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/generated/client";
import { configKeyConst } from "../../common/consts/config-key.const";

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	constructor(@Inject(ConfigService) readonly configService: ConfigService) {
		const { url } = configService.getOrThrow<PrismaType>(configKeyConst.prisma);

		const adapter: PrismaPg = new PrismaPg({
			connectionString: url,
		});

		super({ adapter });
	}

	async onModuleInit(): Promise<void> {
		await this.$connect();
	}

	async onModuleDestroy(): Promise<void> {
		await this.$disconnect();
	}
}
