/**
 * Apply schema + seed using DATABASE_URL from .env
 * Run: npm run db:setup
 */
import { execSync } from "child_process";
import { existsSync } from "fs";

function run(cmd) {
  console.log(">", cmd);
  execSync(cmd, { stdio: "inherit", shell: true });
}

if (!existsSync(".env")) {
  console.error("Create .env from .env.example first.");
  process.exit(1);
}

run("node scripts/sync-schema-provider.mjs");
run("npx prisma generate");
run("npx prisma db push");
run("npx tsx prisma/seed.ts");
console.log("Database connected and seeded.");
