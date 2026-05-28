/*
 * ----------------------------------------------
 * 活動建立／編輯 Server Actions
 * 2026-05-27
 * app/(admin)/events/actions.ts
 * ----------------------------------------------
 * 慣例：驗證 session → Zod 驗證 → Prisma 寫入 → revalidatePath → 回傳 ActionResponse。
 * Server Action 不依賴 UI／proxy 守門，session 缺失一律拒絕。
 */
"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { eventSchema, type EventInput } from "@/lib/schemas/event";
import { ok, fail, type ActionResponse } from "@/lib/action-response";

// keyVisualUrl 為空字串時正規化為 null（選填）；code 已於 Zod transform 轉大寫
function normalize(input: EventInput) {
  return {
    code: input.code,
    title: input.title,
    keyVisualUrl: input.keyVisualUrl ? input.keyVisualUrl : null,
    location: input.location,
    eventAt: input.eventAt,
    notes: input.notes ? input.notes : null,
    themeColor: input.themeColor,
  };
}

// 將活動代號唯一衝突（P2002）轉為表單欄位錯誤
function handleWriteError(e: unknown): ActionResponse<never> {
  if (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    e.code === "P2002"
  ) {
    return fail("活動代號已被使用", { code: ["活動代號已被使用"] });
  }
  throw e;
}

// 建立活動
export async function createEvent(
  input: EventInput,
): Promise<ActionResponse<{ id: number }>> {
  const session = await auth();
  if (!session?.user) return fail("未授權，請重新登入");

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return fail("輸入有誤，請檢查欄位", parsed.error.flatten().fieldErrors);
  }

  let event;
  try {
    event = await prisma.event.create({ data: normalize(parsed.data) });
  } catch (e) {
    return handleWriteError(e);
  }

  revalidatePath("/");
  return ok({ id: event.id }, "活動已建立");
}

// 編輯活動（僅更新 Event 本身，不動票券批次與票券）
export async function updateEvent(
  id: number,
  input: EventInput,
): Promise<ActionResponse<{ id: number }>> {
  const session = await auth();
  if (!session?.user) return fail("未授權，請重新登入");

  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) {
    return fail("輸入有誤，請檢查欄位", parsed.error.flatten().fieldErrors);
  }

  let event;
  try {
    event = await prisma.event.update({
      where: { id },
      data: normalize(parsed.data),
    });
  } catch (e) {
    return handleWriteError(e);
  }

  revalidatePath("/");
  return ok({ id: event.id }, "活動已更新");
}
