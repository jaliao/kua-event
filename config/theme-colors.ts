/*
 * ----------------------------------------------
 * 票券主題顏色（10 組，淺底深色）
 * 2026-05-26
 * config/theme-colors.ts
 * ----------------------------------------------
 * Config-Driven：票券主題色彩的唯一來源。
 * Event.themeColor 存 key，Zod 以此驗證，票券頁套用對應 class。
 */

export const THEME_COLORS = {
  slate: { label: "石板灰", bg: "bg-slate-50", text: "text-slate-900", accent: "border-slate-400" },
  rose: { label: "玫瑰紅", bg: "bg-rose-50", text: "text-rose-900", accent: "border-rose-400" },
  amber: { label: "琥珀黃", bg: "bg-amber-50", text: "text-amber-900", accent: "border-amber-400" },
  emerald: { label: "翡翠綠", bg: "bg-emerald-50", text: "text-emerald-900", accent: "border-emerald-400" },
  teal: { label: "青碧", bg: "bg-teal-50", text: "text-teal-900", accent: "border-teal-400" },
  sky: { label: "天空藍", bg: "bg-sky-50", text: "text-sky-900", accent: "border-sky-400" },
  indigo: { label: "靛藍", bg: "bg-indigo-50", text: "text-indigo-900", accent: "border-indigo-400" },
  violet: { label: "紫羅蘭", bg: "bg-violet-50", text: "text-violet-900", accent: "border-violet-400" },
  fuchsia: { label: "洋紅", bg: "bg-fuchsia-50", text: "text-fuchsia-900", accent: "border-fuchsia-400" },
  stone: { label: "暖石", bg: "bg-stone-50", text: "text-stone-900", accent: "border-stone-400" },
} as const;

export type ThemeColorKey = keyof typeof THEME_COLORS;

export const THEME_COLOR_KEYS = Object.keys(THEME_COLORS) as [
  ThemeColorKey,
  ...ThemeColorKey[],
];

export function getThemeColor(key: string) {
  return THEME_COLORS[key as ThemeColorKey] ?? THEME_COLORS.slate;
}

export function getThemeColorOptions() {
  return THEME_COLOR_KEYS.map((key) => ({ value: key, ...THEME_COLORS[key] }));
}
