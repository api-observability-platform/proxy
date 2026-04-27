import type { Observable } from "rxjs";
import { type ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { isPublicKeyConst } from "../../../common/consts/is-public-key.const";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor(@Inject(Reflector) private readonly reflector: Reflector) {
		super();
	}

	override canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			isPublicKeyConst,
			[context.getHandler(), context.getClass()],
		);

		if (isPublic) {
			return true;
		}

		return super.canActivate(context);
	}
}
