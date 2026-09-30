/**
 * Set Prisma provider from DATABASE_URL (sqlite local / postgresql online).
 */
import fs from "fs";
import path from "path";

function readDatabaseUrl() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return "file:./dev.db";
  const line = fs
    .readFileSync(envPath, "utf8")
    .split("\n")
    .find((l) => l.startsWith("DATABASE_URL="));
  if (!line) return "file:./dev.db";
  return line.split("=")[1]?.trim().replace(/^["']|["']$/g, "") ?? "file:./dev.db";
}

const url = process.env.DATABASE_URL ?? readDatabaseUrl();
const provider = url.startsWith("postgres") ? "postgresql" : "sqlite";

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
let schema = fs.readFileSync(schemaPath, "utf8");
schema = schema.replace(
  /provider\s*=\s*"(sqlite|postgresql)"/,
  `provider = "${provider}"`
);
fs.writeFileSync(schemaPath, schema);
console.log(`Prisma datasource → ${provider}`);
