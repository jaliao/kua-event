/*
 * ----------------------------------------------
 * 票券 Zod 驗證 Schema（前後端共用）
 * 2026-05-26
 * lib/schemas/ticket.ts
 * ----------------------------------------------
 */
import { z } from "zod";
import { TICKET_TYPE_KEYS } from "@/config/ticket-types";

// 新增團體票批次（追加票數時另建一筆，不修改既有批次）
export const groupBatchSchema = z.object({
  eventId: z.coerce.number().int().positive(),
  groupName: z.string().min(1, "請輸入團體名稱"),
  quantity: z.coerce.number().int().min(1, "數量至少 1 張"),
});

export type GroupBatchInput = z.infer<typeof groupBatchSchema>;

// 早鳥名單單列（Excel 匯入後逐列驗證）
export const earlyBirdRowSchema = z.object({
  claimerName: z.string().min(1, "缺少領票人姓名"),
  claimerEmail: z.string().email("Email 格式錯誤"),
});

export const earlyBirdImportSchema = z.object({
  eventId: z.coerce.number().int().positive(),
  rows: z.array(earlyBirdRowSchema).min(1, "名單不可為空"),
});

export type EarlyBirdImportInput = z.infer<typeof earlyBirdImportSchema>;

export const ticketTypeSchema = z.enum(TICKET_TYPE_KEYS);
