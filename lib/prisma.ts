/*
 * ----------------------------------------------
 * Prisma Client 單例（含 pg driver adapter）
 * 2026-05-26
 * lib/prisma.ts
 * ----------------------------------------------
 * Prisma 7 執行期透過 driver adapter 連線。
 * 開發模式下以全域變數避免 HMR 重複建立連線。
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
