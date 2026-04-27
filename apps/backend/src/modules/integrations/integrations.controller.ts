import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Inject,
	Post,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PublicDecorator } from "../../common/decorators/public.decorator";
import { AlertThrottleService } from "../notifications/alert-throttle.service";

type SlackInteractionPayload = {
	type?: string;
	actions?: Array<{ action_id?: string; value?: string }>;
};

type TelegramUpdate = {
	callback_query?: {
		id: string;
		data?: string;
		message?: { chat?: { id: number } };
	};
	message?: {
		chat?: { id: number };
		text?: string;
	};
};

@ApiTags("Integrations")
@Controller("integrations")
export class IntegrationsController {
	constructor(
		@Inject(AlertThrottleService)
		private readonly alertThrottleService: AlertThrottleService,
	) {}

	@PublicDecorator()
	@Post("slack/actions")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Slack interaction payload (mute, etc.)" })
	slackActions(@Body() body: { payload?: string }): { ok: boolean } {
		if (!body.payload) {
			return { ok: true };
		}
		let parsed: SlackInteractionPayload;
		try {
			parsed = JSON.parse(body.payload) as SlackInteractionPayload;
		} catch {
			return { ok: true };
		}
		const action = parsed.actions?.[0];
		if (action?.action_id === "mute_alert" && action.value) {
			try {
				const v = JSON.parse(action.value) as {
					endpointId?: string;
					channelId?: string;
					ms?: number;
				};
				if (v.endpointId && v.channelId && v.ms) {
					void this.alertThrottleService.setCooldownMs(
						v.endpointId,
						v.channelId,
						v.ms,
					);
				}
			} catch {
				// ignore
			}
		}
		return { ok: true };
	}

	@PublicDecorator()
	@Post("telegram/webhook")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Telegram bot updates (stub ack)" })
	telegramWebhook(@Body() _body: TelegramUpdate): { ok: boolean } {
		return { ok: true };
	}

	@PublicDecorator()
	@Post("slack/commands")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Slack slash commands (stub)" })
	slackCommands(@Body() _body: Record<string, string>): { text: string } {
		return {
			text: "Proxy commands: configure your Slack app to POST here; dashboard: check endpoints manually.",
		};
	}
}
