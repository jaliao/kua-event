/*
 * ----------------------------------------------
 * NextAuth 型別擴充
 * 2026-05-26
 * types/next-auth.d.ts
 * ----------------------------------------------
 */
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
