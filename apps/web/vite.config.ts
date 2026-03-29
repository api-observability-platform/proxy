import type { IncomingMessage } from "node:http";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const apiTarget = "http://localhost:3000/api/v1";

/**
 * SPA routes `/logs` and `/endpoints` share URL prefixes with the API proxy.
 * Document navigations use `Accept: text/html` — rewrite to the app shell so Vite serves
 * `index.html` (see `next()` path when bypass returns a string). Returning `false`
 * from bypass makes Vite respond with 404 and a blank page.
 */
function bypassProxyForSpaDocumentNavigation(
	req: IncomingMessage,
): string | undefined {
	const method = req.method ?? "GET";
	if (method !== "GET" && method !== "HEAD") {
		return undefined;
	}
	const accept = req.headers.accept;
	if (typeof accept === "string" && accept.includes("text/html")) {
		return "/index.html";
	}
	return undefined;
}

const proxyPaths = [
	"/auth",
	"/endpoints",
	"/logs",
	"/analytics",
	"/r",
	"/notifications",
	"/integrations",
];

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	server: {
		proxy: Object.fromEntries(
			proxyPaths.map((pathPrefix) => [
				pathPrefix,
				{
					target: apiTarget,
					changeOrigin: true,
					secure: false,
					bypass: bypassProxyForSpaDocumentNavigation,
				},
			]),
		),
	},
});
