/*
 * ----------------------------------------------
 * 票券流水號產生器（per event + type 原子遞增）
 * 2026-05-26
 * lib/serial.ts
 * ----------------------------------------------
 * 必須在 prisma.$transaction() 內呼叫以確保併發安全。
 * 格式：{EVENTID}-{E|G}-{流水號:4碼}，例：12-G-0007
 */
import type { Prisma, TicketType } from "@prisma/client";

export async function nextTicketSerial(
  tx: Prisma.TransactionClient,
  eventId: number,
  type: TicketType,
): Promise<string> {
  const counter = await tx.ticketCounter.upsert({
    where: { eventId_type: { eventId, type } },
    create: { eventId, type, counter: 1 },
    update: { counter: { increment: 1 } },
  });

  const prefix = type === "EARLY_BIRD" ? "E" : "G";
  const seq = String(counter.counter).padStart(4, "0");
  return `${eventId}-${prefix}-${seq}`;
}
