/*
 * ----------------------------------------------
 * 團體票批次 Server Actions
 * 2026-05-28
 * app/(admin)/events/[id]/batches/actions.ts
 * ----------------------------------------------
 * 慣例：驗證 session → Zod 驗證 → 單一 $transaction 寫入 → revalidatePath → 回傳 ActionResponse。
 * 批次為 additive：建立後永不修改、不刪除；追加票數一律另建批次。
 */
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { nextTicketSerial } from "@/lib/serial";
import { groupBatchSchema, type GroupBatchInput } from "@/lib/schemas/batch";
import { ok, fail, type ActionResponse } from "@/lib/action-response";

// 建立團體票批次：單一交易內建立批次 + N 張票券（序號原子遞增）
export async function createGroupBatch(
  eventId: number,
  input: GroupBatchInput,
): Promise<ActionResponse<{ batchId: number }>> {
  const session = await auth();
  if (!session?.user) return fail("未授權，請重新登入");

  const parsed = groupBatchSchema.safeParse(input);
  if (!parsed.success) {
    return fail("輸入有誤，請檢查欄位", parsed.error.flatten().fieldErrors);
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { code: true },
  });
  if (!event) return fail("查無此活動");

  const { groupName, quantity } = parsed.data;

  const batch = await prisma.$transaction(async (tx) => {
    const created = await tx.ticketBatch.create({
      data: { eventId, type: "GROUP", groupName, quantity },
    });

    for (let i = 0; i < quantity; i++) {
      const serialNo = await nextTicketSerial(tx, eventId, event.code);
      await tx.ticket.create({
        data: {
          eventId,
          batchId: created.id,
          type: "GROUP",
          serialNo,
          groupName,
        },
      });
    }

    return created;
  });

  revalidatePath(`/events/${eventId}/batches`);
  return ok({ batchId: batch.id }, `已建立 ${quantity} 張團體票`);
}
