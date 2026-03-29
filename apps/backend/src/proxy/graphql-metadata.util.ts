import type { Prisma } from "@prisma/generated/client";

/** Parses a GraphQL-over-HTTP JSON body for analytics metadata. */
export function extractGraphqlRequestMetadata(
	body: Buffer | null,
): Prisma.InputJsonValue | null {
	if (!body?.length) return null;
	try {
		const json = JSON.parse(body.toString("utf8")) as Record<string, unknown>;
		const query = json.query;
		if (typeof query !== "string") return null;
		const opName =
			typeof json.operationName === "string" ? json.operationName : null;
		const trimmed = query.trim();
		const operationType = trimmed.startsWith("mutation")
			? "mutation"
			: trimmed.startsWith("subscription")
				? "subscription"
				: "query";
		return {
			graphqlOperationName: opName,
			graphqlOperationType: operationType,
		};
	} catch {
		return null;
	}
}
