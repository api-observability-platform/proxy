import type { Prisma } from "@prisma/generated/client";

/** Merges base request metadata with optional enricher output for persistence. */
export function mergeLogMetadata(
	base: Prisma.InputJsonValue | null | undefined,
	added: Record<string, unknown> | null | undefined,
): Prisma.InputJsonValue | null {
	if (!base && (!added || Object.keys(added).length === 0)) {
		return null;
	}
	const baseObj =
		base !== null &&
		base !== undefined &&
		typeof base === "object" &&
		!Array.isArray(base)
			? { ...(base as Record<string, unknown>) }
			: {};
	const merged = { ...baseObj, ...(added ?? {}) };
	return Object.keys(merged).length > 0
		? (merged as Prisma.InputJsonValue)
		: null;
}
