import { existsSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "prisma/config";

const envFilePath: string = join(__dirname, ".env");
if (existsSync(envFilePath)) {
	process.loadEnvFile(envFilePath);
}

const seedScriptPath: string = join(__dirname, "prisma", "seed.ts");

export default defineConfig({
	datasource: {
		url: process.env.POSTGRES_URL,
	},
	migrations: {
		path: join(__dirname, "prisma", "migrations"),
		seed: `node --experimental-strip-types "${seedScriptPath}"`,
	},
	schema: join(__dirname, "prisma", "schema.prisma"),
});
