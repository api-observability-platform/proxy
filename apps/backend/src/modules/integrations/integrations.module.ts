import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { IntegrationsController } from "./integrations.controller";

@Module({
	imports: [NotificationsModule],
	controllers: [IntegrationsController],
})
export class IntegrationsModule {}
