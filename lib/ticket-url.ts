/*
 * ----------------------------------------------
 * 票券公開網址工具
 * 2026-05-28
 * lib/ticket-url.ts
 * ----------------------------------------------
 * 以 NEXT_PUBLIC_APP_URL 為 base 組合 /t/{accessToken}。
 * production/test/本地網域不同，集中於此讀取環境變數。
 */

export function ticketUrl(accessToken: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/+$/, "");
  return `${base}/t/${accessToken}`;
}
