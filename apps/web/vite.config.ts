import type { IncomingMessage } from "node:http";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const apiTarget = "http://localhost:3000/api/v1";

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
	envDir: path.resolve(__dirname, "../.."),
	plugins: [react(), tailwindcss()],
	optimizeDeps: {
		exclude: ["@proxy-server/shared"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),

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
