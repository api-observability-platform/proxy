import { Controller, Get, Inject } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { PublicDecorator } from "../../common/decorators/public.decorator";
import { HealthService } from "./health.service";

@SkipThrottle()
@ApiTags("Health")
@Controller("health")
export class HealthController {
	constructor(
		@Inject(HealthService) private readonly healthService: HealthService,
	) {}

	@PublicDecorator()
	@Get("live")
	@ApiOperation({ summary: "Liveness probe" })
	liveness(): { status: string } {
		return { status: "ok" };
	}

	@PublicDecorator()
	@Get("ready")
	@ApiOperation({ summary: "Readiness probe (database)" })
	async readiness(): Promise<{ status: string }> {
		await this.healthService.assertDatabaseReady();
		return { status: "ok" };
	}
}
