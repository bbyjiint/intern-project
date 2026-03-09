import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { loadDotEnv } from "./env";

loadDotEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Put it in backend/.env");
}

const adapter = new PrismaPg({ connectionString });
// Keep a single Prisma client instance backed by the pg adapter.
const prisma = new PrismaClient({ adapter });

export default prisma;