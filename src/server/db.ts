import { PrismaClient } from "@prisma/client";

import { env } from "@/env.mjs";

const createPrismaClient = () => {
  try {
    return new PrismaClient({
      log:
        env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  } catch (error) {
    console.error("[Prisma] Failed to instantiate PrismaClient:", error);
    throw error;
  }
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Test database connection and handle errors
db.$connect().catch((error) => {
  console.error("[Prisma] Database connection error:", error);
  process.exit(1);
});
