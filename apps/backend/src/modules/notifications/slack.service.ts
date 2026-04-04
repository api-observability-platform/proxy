import { Injectable } from "@nestjs/common";
import { outboundWebhookConstants } from "./outbound-webhook.constants";

@Injectable()
export class SlackService {
	async send(config: { webhookUrl: string }, message: string): Promise<void> {
		const res = await fetch(config.webhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				text: message,
			}),
			signal: AbortSignal.timeout(outboundWebhookConstants.FETCH_TIMEOUT_MS),
		});
		if (!res.ok) {
			throw new Error(`Slack webhook error: ${res.status}`);
		}
	}

	async sendBlockKit(
		config: { webhookUrl: string },
		payload: Record<string, unknown>,
	): Promise<void> {
		const res = await fetch(config.webhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
			signal: AbortSignal.timeout(outboundWebhookConstants.FETCH_TIMEOUT_MS),
		});
		if (!res.ok) {
			throw new Error(`Slack webhook error: ${res.status}`);
		}
	}
}
