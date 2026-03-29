import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

const sharedSrcIndex = path.resolve(
	__dirname,
	"../../libs/shared/src/index.ts",
);

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@proxy-server/shared": sharedSrcIndex,
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
	},
});
