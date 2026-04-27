import type { AppType } from "../../core/config/types/app.type.js";
import {
	type CallHandler,
	type ExecutionContext,
	GatewayTimeoutException,
	Inject,
	Injectable,
	type NestInterceptor,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	catchError,
	type Observable,
	TimeoutError,
	throwError,
	timeout,
} from "rxjs";
import { configKeyConst } from "../consts/config-key.const.js";

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
	private readonly requestTimeout: number;

	constructor(@Inject(ConfigService) readonly configService: ConfigService) {
		this.requestTimeout = configService.getOrThrow<AppType>(
			configKeyConst.app,
		).requestTimeout;
	}

	intercept(
		_context: ExecutionContext,
		next: CallHandler<unknown>,
	): Observable<unknown> {
		return next.handle().pipe(
			timeout(this.requestTimeout),
			catchError((e) => {
				if (e instanceof TimeoutError) {
					throw new GatewayTimeoutException("Timeout has occurred");
				}
				return throwError(() => e);
			}),
		);
	}
}
