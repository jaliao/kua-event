/*
 * ----------------------------------------------
 * 團體票批次 Zod 驗證 Schema（前後端共用）
 * 2026-05-28
 * lib/schemas/batch.ts
 * ----------------------------------------------
 * 數量上限避免單一交易內逐張取號 + 寫入鎖定計數器過久。
 */
import { z } from "zod";

export const MAX_BATCH_QUANTITY = 500;

export const groupBatchSchema = z.object({
  groupName: z.string().trim().min(1, "請輸入團體名稱").max(100, "團體名稱過長"),
  quantity: z.coerce
    .number({ message: "請輸入數量" })
    .int("數量需為整數")
    .min(1, "數量需至少 1 張")
    .max(MAX_BATCH_QUANTITY, `數量上限為 ${MAX_BATCH_QUANTITY} 張`),
});

export type GroupBatchInput = z.infer<typeof groupBatchSchema>;
