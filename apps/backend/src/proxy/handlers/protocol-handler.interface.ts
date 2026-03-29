import type { Endpoint, EndpointProtocol } from "@prisma/generated/client";
import type { Request } from "express";
import type { ProxyContext } from "../proxy-context.type.js";

/** Dispatches slug-matched traffic by endpoint protocol. */
export interface ProtocolHandler {
	readonly protocol: EndpointProtocol;
	/** Whether this handler should process the request for the given endpoint. */
	canHandle(req: Request, endpoint: Endpoint): boolean;
	handle(ctx: ProxyContext): Promise<void>;
}
