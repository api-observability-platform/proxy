import { proxyRequestConstants } from "./proxy-request.constants.js";

/** Resolves slug and path for `/r/:slug` and subdomain routing. */
export function extractSlugAndPathFromProxyRequest(
	host: string,
	pathWithoutQuery: string,
	baseDomain: string,
): { slug: string | null; path: string; isProxy: boolean } {
	const pathMatch = pathWithoutQuery.match(/^\/r\/([a-z0-9]+)(\/.*)?$/i);
	if (pathMatch) {
		return {
			slug: pathMatch[1],
			path: pathMatch[2] ?? "/",
			isProxy: true,
		};
	}
	const parts = host.split(".");
	if (parts.length >= 2) {
		const subdomain = parts[0];
		const rest = parts.slice(1).join(".");
		if (rest === baseDomain || rest.endsWith(`.${baseDomain}`)) {
			const reserved =
				proxyRequestConstants.RESERVED_PROXY_SUBDOMAIN_SLUGS as readonly string[];
			const skip = new Set(reserved.map((s) => s.toLowerCase()));
			if (!skip.has(subdomain.toLowerCase())) {
				return {
					slug: subdomain,
					path: pathWithoutQuery || "/",
					isProxy: true,
				};
			}
		}
	}
	return { slug: null, path: pathWithoutQuery, isProxy: false };
}
