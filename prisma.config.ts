// ----------------------------------------------
// prisma.config.ts — Prisma 7 設定檔
// 2026-05-26
// prisma.config.ts
// ----------------------------------------------
// Prisma 7 不再自動載入 .env，且連線字串改由此檔提供給 CLI（migrate / studio）。
// 執行期的 PrismaClient 則透過 driver adapter 連線（見 lib/prisma.ts）。
import path from "node:path";
import { defineConfig } from "prisma/config";

// 載入 .env 供 CLI 使用（Node 20.12+ 內建）
try {
  process.loadEnvFile();
} catch {
  // .env 不存在時略過（如 CI 已注入環境變數）
}

export default defineConfig({
  // 多檔案 Schema 目錄（base / auth / event）
  schema: path.join("prisma", "schema"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
