/*
 * ----------------------------------------------
 * 票券批次資料存取層
 * 2026-05-28
 * lib/data/batches.ts
 * ----------------------------------------------
 */
import { prisma } from "@/lib/prisma";

// 活動底下的團體票批次清單（含票券數），新到舊排序
export async function getBatchesByEvent(eventId: number) {
  return prisma.ticketBatch.findMany({
    where: { eventId, type: "GROUP" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tickets: true } } },
  });
}

// 單一批次與其票券（匯出 Excel 用）
export async function getBatchWithTickets(batchId: number) {
  return prisma.ticketBatch.findUnique({
    where: { id: batchId },
    include: {
      event: true,
      tickets: { orderBy: { serialNo: "asc" } },
    },
  });
}
