import { Injectable } from "@nestjs/common";
import { outboundWebhookConstants } from "./outbound-webhook.constants";

@Injectable()
export class TelegramService {
	async send(
		config: { botToken: string; chatId: string },
		message: string,
		replyMarkup?: Record<string, unknown>,
	): Promise<void> {
		const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
		const body: Record<string, unknown> = {
			chat_id: config.chatId,
			text: message,
			parse_mode: "HTML",
		};
		if (replyMarkup) {
			body.reply_markup = replyMarkup;
		}
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(outboundWebhookConstants.FETCH_TIMEOUT_MS),
		});
		if (!res.ok) {
			throw new Error(`Telegram API error: ${res.status}`);
		}
	}
}
