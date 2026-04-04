import type { Endpoint, EndpointProtocol } from "@prisma/generated/client";
import type { Request } from "express";
import type { ProxyContext } from "../proxy-context.type.js";

export interface ProtocolHandler {
	readonly protocol: EndpointProtocol;

	canHandle(req: Request, endpoint: Endpoint): boolean;
	handle(ctx: ProxyContext): Promise<void>;
}
