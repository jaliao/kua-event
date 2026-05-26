/*
 * ----------------------------------------------
 * NextAuth 完整設定（後台 Google OAuth + Email 白名單）
 * 2026-05-26
 * auth.ts
 * ----------------------------------------------
 * 僅後台管理員登入。signIn 時比對 WhitelistedEmail（isActive），
 * 非白名單者導回 /login?error=NotWhitelisted。
 */
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,

    // 白名單驗證：唯有啟用中的白名單 Email 可登入
    async signIn({ user }) {
      if (!user.email) return false;
      const allowed = await prisma.whitelistedEmail.findFirst({
        where: { email: user.email, isActive: true },
      });
      if (!allowed) return "/login?error=NotWhitelisted";

      // 同步使用者資料（建立或更新登入時間）
      await prisma.user.upsert({
        where: { email: user.email },
        update: { lastLoginAt: new Date(), name: user.name, image: user.image },
        create: { email: user.email, name: user.name, image: user.image },
      });
      return true;
    },

    // 將 DB 使用者的 id / role 寫入 JWT
    async jwt({ token }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },

    // 將 id / role 暴露於 session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
