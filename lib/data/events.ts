/*
 * ----------------------------------------------
 * 活動資料存取層
 * 2026-05-26
 * lib/data/events.ts
 * ----------------------------------------------
 */
import { prisma } from "@/lib/prisma";

export async function getEvents() {
  return prisma.event.findMany({ orderBy: { eventAt: "asc" } });
}

export async function getEventById(id: number) {
  return prisma.event.findUnique({ where: { id } });
}

// 領票人公開票券頁（免登入、免驗票）：以 accessToken 取單張票券
export async function getTicketByToken(accessToken: string) {
  return prisma.ticket.findUnique({
    where: { accessToken },
    include: { event: true },
  });
}
