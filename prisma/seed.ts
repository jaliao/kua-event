/*
 * ----------------------------------------------
 * 資料庫種子資料
 * 2026-05-26
 * prisma/seed.ts
 * ----------------------------------------------
 * 建立後台白名單管理員與四個活動場次（紐約早/晚、LA 早/晚）。
 * 執行：npm run db:seed
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 後台管理員白名單
  await prisma.whitelistedEmail.upsert({
    where: { email: "justin@blockcode.com.tw" },
    update: {},
    create: { email: "justin@blockcode.com.tw", note: "初始管理員" },
  });

  // 四個獨立場次
  const sessions = [
    { title: "紐約場（早場）", location: "New York", themeColor: "rose" },
    { title: "紐約場（晚場）", location: "New York", themeColor: "indigo" },
    { title: "洛杉磯場（早場）", location: "Los Angeles", themeColor: "amber" },
    { title: "洛杉磯場（晚場）", location: "Los Angeles", themeColor: "teal" },
  ];

  for (const s of sessions) {
    const exists = await prisma.event.findFirst({ where: { title: s.title } });
    if (!exists) {
      await prisma.event.create({
        data: {
          title: s.title,
          location: s.location,
          themeColor: s.themeColor,
          eventAt: new Date("2026-09-01T19:00:00Z"),
          notes: "請於開演前 30 分鐘入場。",
        },
      });
    }
  }

  console.log("Seed 完成 ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
