import type { CreateReportScheduleDto } from "./dto/create-report-schedule.dto";
import {
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";

@Injectable()
export class ReportSchedulesService {
	constructor(
		@Inject(PrismaService) private readonly prismaService: PrismaService,
	) {}

	async create(userId: string, dto: CreateReportScheduleDto) {
		const channel = await this.prismaService.notificationChannel.findUnique({
			where: { id: dto.channelId },
		});
		if (!channel || channel.userId !== userId) {
			throw new ForbiddenException("Invalid channel");
		}
		return this.prismaService.reportSchedule.create({
			data: {
				userId,
				channelId: dto.channelId,
				frequency: dto.frequency,
			},
		});
	}

	async list(userId: string) {
		return this.prismaService.reportSchedule.findMany({
			where: { userId, isActive: true },
			orderBy: { createdAt: "desc" },
		});
	}

	async remove(id: string, userId: string): Promise<{ success: boolean }> {
		const row = await this.prismaService.reportSchedule.findUnique({
			where: { id },
		});
		if (!row || row.userId !== userId) {
			throw new NotFoundException("Schedule not found");
		}
		await this.prismaService.reportSchedule.delete({ where: { id } });
		return { success: true };
	}
}
