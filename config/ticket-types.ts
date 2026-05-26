/*
 * ----------------------------------------------
 * 票券種類（Config-Driven）
 * 2026-05-26
 * config/ticket-types.ts
 * ----------------------------------------------
 * 對應 Prisma enum TicketType。
 */

export const TICKET_TYPES = {
  EARLY_BIRD: { label: "早鳥票", description: "上傳名單後由系統 Email 寄發" },
  GROUP: { label: "團體票", description: "以團體為單位批次產生，匯出 Excel 由窗口分派" },
} as const;

export type TicketTypeKey = keyof typeof TICKET_TYPES;

export const TICKET_TYPE_KEYS = Object.keys(TICKET_TYPES) as [
  TicketTypeKey,
  ...TicketTypeKey[],
];

export function getTicketType(key: string) {
  return TICKET_TYPES[key as TicketTypeKey];
}
