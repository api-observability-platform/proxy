import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../core/prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { SlackService } from "./slack.service";
import { TelegramService } from "./telegram.service";

/**
 * Sends scheduled analytics digests to user channels.
 */
@Injectable()
export class ReportsService {
	private readonly logger = new Logger(ReportsService.name);

	constructor(
		@Inject(PrismaService) private readonly prisma: PrismaService,
		@Inject(SlackService) private readonly slack: SlackService,
		@Inject(TelegramService) private readonly telegram: TelegramService,
		@Inject(EmailService) private readonly email: EmailService,
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_9AM)
	async runDailyDigests(): Promise<void> {
		await this.runForFrequency("DAILY");
	}

	@Cron("0 10 * * 1")
	async runWeeklyDigests(): Promise<void> {
		await this.runForFrequency("WEEKLY");
	}

	private async runForFrequency(frequency: "DAILY" | "WEEKLY"): Promise<void> {
		const schedules = await this.prisma.reportSchedule.findMany({
			where: { isActive: true, frequency },
			include: { channel: true, user: true },
		});
		const since = new Date();
		if (frequency === "DAILY") {
			since.setDate(since.getDate() - 1);
		} else {
			since.setDate(since.getDate() - 7);
		}
		for (const s of schedules) {
			try {
				const text = await this.buildDigestText(s.userId, since);
				await this.sendDigest(s.channel, text);
			} catch (err: unknown) {
				this.logger.warn(
					`Report ${s.id}: ${err instanceof Error ? err.message : err}`,
				);
			}
		}
	}

	private async buildDigestText(userId: string, since: Date): Promise<string> {
		const endpoints = await this.prisma.endpoint.findMany({
			where: { userId },
			select: { id: true, name: true },
		});
		const lines: string[] = [];
		lines.push(`Digest since ${since.toISOString()}`);
		for (const ep of endpoints) {
			const count = await this.prisma.requestLog.count({
				where: { endpointId: ep.id, createdAt: { gte: since } },
			});
			const errors = await this.prisma.requestLog.count({
				where: {
					endpointId: ep.id,
					createdAt: { gte: since },
					responseStatus: { gte: 500 },
				},
			});
			lines.push(`- ${ep.name}: ${count} requests, ${errors} 5xx/502`);
		}
		return lines.join("\n");
	}

	private async sendDigest(
		channel: { type: string; config: unknown },
		text: string,
	): Promise<void> {
		const config = channel.config as Record<string, unknown>;
		if (channel.type === "SLACK") {
			const webhookUrl =
				typeof config.webhookUrl === "string" ? config.webhookUrl : "";
			if (webhookUrl) await this.slack.send({ webhookUrl }, text);
		} else if (channel.type === "TELEGRAM") {
			const botToken =
				typeof config.botToken === "string" ? config.botToken : "";
			const chatId = typeof config.chatId === "string" ? config.chatId : "";
			if (botToken && chatId) {
				await this.telegram.send({ botToken, chatId }, text);
			}
		} else if (channel.type === "EMAIL") {
			const emails = Array.isArray(config.emails)
				? config.emails.filter((e): e is string => typeof e === "string")
				: typeof config.email === "string"
					? [config.email]
					: [];
			for (const to of emails) {
				await this.email.sendAlertEmail(
					to,
					"Proxy digest",
					text,
					`<pre>${escapeXml(text)}</pre>`,
				);
			}
		}
	}
}

function escapeXml(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
