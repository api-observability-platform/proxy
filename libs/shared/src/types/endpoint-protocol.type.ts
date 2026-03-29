/** Proxy protocols supported by an endpoint (mirrors Prisma `EndpointProtocol`). */
export const ENDPOINT_PROTOCOLS = [
	"HTTP",
	"WEBSOCKET",
	"GRAPHQL",
	"GRPC",
	"SSE",
	"TCP",
] as const;

export type EndpointProtocol = (typeof ENDPOINT_PROTOCOLS)[number];
