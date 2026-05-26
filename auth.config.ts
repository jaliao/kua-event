/*
 * ----------------------------------------------
 * NextAuth 邊緣安全設定（供 middleware 使用）
 * 2026-05-26
 * auth.config.ts
 * ----------------------------------------------
 * 此檔不得引入 Prisma / Node 專屬模組，因 middleware 跑在 edge runtime。
 * Prisma 相關的白名單檢查放在 auth.ts（Node runtime 的 route handler）。
 */
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// 免登入的公開路徑（領票人票券頁、登入頁）
function isPublicPath(pathname: string): boolean {
  return pathname === "/login" || pathname.startsWith("/t/");
}

export const authConfig = {
  providers: [Google],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 天
  pages: { signIn: "/login" },
  callbacks: {
    // middleware 授權判斷：公開路徑放行，其餘需登入
    authorized({ auth, request }) {
      if (isPublicPath(request.nextUrl.pathname)) return true;
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
