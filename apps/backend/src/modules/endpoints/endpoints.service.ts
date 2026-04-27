import type { CurrentUserPayload } from "../../common/types/current-user-payload.type";
import type { SlugType } from "../../core/config/types/slug.type";
import type { CreateEndpointDto } from "./dto/create-endpoint.dto";
import type { ListEndpointsQueryDto } from "./dto/list-endpoints-query.dto";
import type { UpdateEndpointDto } from "./dto/update-endpoint.dto";
import type {
	EndpointDto,
	EndpointListResponseDto,
} from "./types/endpoints.type";
import {
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type Endpoint, Prisma } from "@prisma/generated/client";
import { customAlphabet } from "nanoid";
import { configKeyConst } from "../../common/consts/config-key.const";
import { paginationConst } from "../../common/consts/pagination.const";
import { PrismaService } from "../../core/prisma/prisma.service";
import { mapEndpointToDto } from "./endpoint.mapper";

@Injectable()
export class EndpointsService {
	private readonly slugAlphabet: string = "";
	private readonly slugLength: number = 0;
	private readonly slugMaxAttempts: number = 0;

	constructor(
		@Inject(PrismaService) private readonly prismaService: PrismaService,
		@Inject(ConfigService) readonly configService: ConfigService,
	) {
		const slugConfig = this.configService.getOrThrow<SlugType>(
			configKeyConst.slug,
		);

		this.slugAlphabet = slugConfig.slugAlphabet;
		this.slugLength = slugConfig.slugLength;
		this.slugMaxAttempts = slugConfig.slugMaxAttempts;
	}

	private toJsonValue(value: unknown): Prisma.InputJsonValue {
		return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
	}

	async create(userId: string, dto: CreateEndpointDto): Promise<EndpointDto> {
		const generateSlug = customAlphabet(this.slugAlphabet, this.slugLength);
		let slug = generateSlug();
		let attempts = 0;
		while (attempts < this.slugMaxAttempts) {
			const existing = await this.prismaService.endpoint.findUnique({
				where: { slug },
			});
			if (!existing) break;
			slug = generateSlug();
			attempts++;
		}
		const created = await this.prismaService.endpoint.create({
			data: {
				userId,
				name: dto.name,
				slug,
				targetUrl: dto.targetUrl,
				...(dto.rateLimitConfig != null && {
					rateLimitConfig: this.toJsonValue(dto.rateLimitConfig),
				}),
				...(dto.transformRules != null && {
					transformRules: this.toJsonValue(dto.transformRules),
				}),
				isActive: dto.isActive ?? true,
			},
		});
		return mapEndpointToDto(created);
	}

	async findAll(
		userId: string,
		query: ListEndpointsQueryDto,
	): Promise<EndpointListResponseDto> {
		const offset = query.offset ?? paginationConst.defaultOffset;
		const limit = Math.min(
			query.limit ?? paginationConst.defaultListLimit,
			paginationConst.maxListLimit,
		);
		const where = { userId };
		const [items, total] = await Promise.all([
			this.prismaService.endpoint.findMany({
				where,
				orderBy: { createdAt: "desc" },
				skip: offset,
				take: limit,
			}),
			this.prismaService.endpoint.count({ where }),
		]);
		return {
			items: items.map(mapEndpointToDto),
			total,
			limit,
			offset,
		};
	}

	private async getOwnedEndpointOrThrow(
		id: string,
		user: CurrentUserPayload,
	): Promise<Endpoint> {
		const endpoint = await this.prismaService.endpoint.findUnique({
			where: { id },
		});
		if (!endpoint) {
			throw new NotFoundException("Endpoint not found");
		}
		if (endpoint.userId !== user.id) {
			throw new ForbiddenException("Access denied");
		}
		return endpoint;
	}

	async findOne(id: string, user: CurrentUserPayload): Promise<EndpointDto> {
		const endpoint = await this.getOwnedEndpointOrThrow(id, user);
		return mapEndpointToDto(endpoint);
	}

	async findBySlug(slug: string): Promise<Endpoint | null> {
		return this.prismaService.endpoint.findUnique({
			where: { slug, isActive: true },
		});
	}

	async update(
		id: string,
		user: CurrentUserPayload,
		dto: UpdateEndpointDto,
	): Promise<EndpointDto> {
		await this.getOwnedEndpointOrThrow(id, user);
		const updated = await this.prismaService.endpoint.update({
			where: { id },
			data: {
				...(dto.name !== undefined && { name: dto.name }),
				...(dto.targetUrl !== undefined && { targetUrl: dto.targetUrl }),
				...(dto.rateLimitConfig !== undefined && {
					rateLimitConfig:
						dto.rateLimitConfig === null
							? Prisma.DbNull
							: this.toJsonValue(dto.rateLimitConfig),
				}),
				...(dto.transformRules !== undefined && {
					transformRules:
						dto.transformRules === null
							? Prisma.DbNull
							: this.toJsonValue(dto.transformRules),
				}),
				...(dto.isActive !== undefined && { isActive: dto.isActive }),
			},
		});
		return mapEndpointToDto(updated);
	}

	async remove(
		id: string,
		user: CurrentUserPayload,
	): Promise<{ success: boolean }> {
		await this.getOwnedEndpointOrThrow(id, user);
		await this.prismaService.endpoint.delete({
			where: { id },
		});
		return { success: true };
	}
}
