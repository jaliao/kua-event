/*
 * ----------------------------------------------
 * 活動資料存取層
 * 2026-05-26
 * lib/data/events.ts
 * ----------------------------------------------
 */
import { prisma } from "@/lib/prisma";

// 儀表板用：活動清單，每筆帶票券分項計數（總數 / 團體票 / 早鳥票）。
// 以單一 groupBy 取各活動每票種張數，避免逐活動查詢（N+1）。
export async function getEvents() {
  const events = await prisma.event.findMany({ orderBy: { eventAt: "asc" } });

  const grouped = await prisma.ticket.groupBy({
    by: ["eventId", "type"],
    _count: { _all: true },
  });

  const countsByEvent = new Map<number, { group: number; earlyBird: number }>();
  for (const row of grouped) {
    const entry = countsByEvent.get(row.eventId) ?? { group: 0, earlyBird: 0 };
    if (row.type === "GROUP") entry.group = row._count._all;
    else if (row.type === "EARLY_BIRD") entry.earlyBird = row._count._all;
    countsByEvent.set(row.eventId, entry);
  }

  return events.map((event) => {
    const c = countsByEvent.get(event.id) ?? { group: 0, earlyBird: 0 };
    return {
      ...event,
      counts: {
        total: c.group + c.earlyBird,
        group: c.group,
        earlyBird: c.earlyBird,
      },
    };
  });
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
