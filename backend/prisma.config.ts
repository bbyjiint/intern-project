import { defineConfig, env } from "prisma/config";

// Minimal .env loader so Prisma CLI can read DATABASE_URL from `backend/.env`
// without requiring additional dependencies.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(dotEnvPath: string) {
  if (!existsSync(dotEnvPath)) return;
  const content = readFileSync(dotEnvPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq <= 0) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    // Strip surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnv(resolve(process.cwd(), ".env"));

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});

