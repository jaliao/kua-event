/*
 * ----------------------------------------------
 * 票券流水號產生器（per event，跨票種共用，原子遞增）
 * 2026-05-27
 * lib/serial.ts
 * ----------------------------------------------
 * 必須在 prisma.$transaction() 內呼叫以確保併發安全。
 * 格式：{活動代號}{流水號:4碼}，例：NY010007
 */
import type { Prisma } from "@prisma/client";

export async function nextTicketSerial(
  tx: Prisma.TransactionClient,
  eventId: number,
  code: string,
): Promise<string> {
  const counter = await tx.ticketCounter.upsert({
    where: { eventId },
    create: { eventId, counter: 1 },
    update: { counter: { increment: 1 } },
  });

  const seq = String(counter.counter).padStart(4, "0");
  return `${code}${seq}`;
}
