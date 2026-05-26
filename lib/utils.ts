/*
 * ----------------------------------------------
 * 共用工具
 * 2026-05-26
 * lib/utils.ts
 * ----------------------------------------------
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// className 合併（shadcn/ui 慣例）
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
