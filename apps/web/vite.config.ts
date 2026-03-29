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

const sharedSrcIndex = path.resolve(
	__dirname,
	"../../libs/shared/src/index.ts",
);

export default defineConfig({
	/** Load `VITE_*` from the monorepo root `.env` when running `npm run dev -w apps/web`. */
	envDir: path.resolve(__dirname, "../.."),
	plugins: [react(), tailwindcss()],
	optimizeDeps: {
		exclude: ["@proxy-server/shared"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			/** Bundled as ESM from source — avoids Vite mis-reading CJS `exports` from `dist/`. */
			"@proxy-server/shared": sharedSrcIndex,
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
