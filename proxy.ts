/*
 * ----------------------------------------------
 * 認證 Proxy（Next 16 取代 middleware）
 * 2026-05-26
 * proxy.ts
 * ----------------------------------------------
 * 使用 edge 安全的 authConfig，依 authorized callback 攔截未登入請求。
 * 公開路徑（/login、/t/*）放行，其餘後台路徑需登入。
 */
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // 排除靜態資源與 NextAuth API 路由
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
