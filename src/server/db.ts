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

// Avoid eager DB connections during Next.js build and make failures non-fatal
const isNextBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
if (!isNextBuildPhase && env.NODE_ENV !== "test") {
  db.$connect().catch((error) => {
    console.error("[Prisma] Database connection error (non-fatal):", error);
  });
}
