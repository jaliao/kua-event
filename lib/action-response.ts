/*
 * ----------------------------------------------
 * Server Action 統一回傳型別
 * 2026-05-26
 * lib/action-response.ts
 * ----------------------------------------------
 */

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string; // 供 toast 顯示
  data?: T;
  errors?: Record<string, string[]>; // Zod 欄位錯誤
};

export function ok<T>(data?: T, message?: string): ActionResponse<T> {
  return { success: true, data, message };
}

export function fail(
  message: string,
  errors?: Record<string, string[]>,
): ActionResponse<never> {
  return { success: false, message, errors };
}
