import { Module } from "@nestjs/common";
import { ProxyModule } from "../../proxy/proxy.module";
import { LogsController } from "./logs.controller";
import { LogsService } from "./logs.service";

@Module({
	imports: [ProxyModule],
	controllers: [LogsController],
	providers: [LogsService],
})
export class LogsModule {}
