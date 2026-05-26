/*
 * ----------------------------------------------
 * NextAuth API 路由
 * 2026-05-26
 * app/api/auth/[...nextauth]/route.ts
 * ----------------------------------------------
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
