/*
 * ----------------------------------------------
 * 活動 Zod 驗證 Schema（前後端共用）
 * 2026-05-26
 * lib/schemas/event.ts
 * ----------------------------------------------
 */
import { z } from "zod";
import { THEME_COLOR_KEYS } from "@/config/theme-colors";

export const eventSchema = z.object({
  code: z
    .string()
    .min(1, "請輸入活動代號")
    .max(20, "活動代號過長")
    .regex(/^[A-Za-z0-9]+$/, "活動代號僅限英文與數字")
    .transform((v) => v.toUpperCase()),
  title: z.string().min(1, "請輸入活動標題"),
  keyVisualUrl: z.string().url("主視覺需為有效網址").optional().or(z.literal("")),
  location: z.string().min(1, "請輸入活動地點"),
  eventAt: z.coerce.date({ message: "請選擇活動時間" }),
  notes: z.string().optional(),
  themeColor: z.enum(THEME_COLOR_KEYS),
});

export type EventInput = z.infer<typeof eventSchema>;
