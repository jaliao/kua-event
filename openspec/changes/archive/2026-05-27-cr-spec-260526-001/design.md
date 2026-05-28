## Context

後台儀表板（`app/(admin)/page.tsx`）目前僅以 `getEvents()` 列出場次，缺少建立/編輯入口。本次要把既有零件串起來：`Event` model、`eventSchema`（`lib/schemas/event.ts`）、`getEventById`（`lib/data/events.ts`）、`ActionResponse`（`lib/action-response.ts`）、`THEME_COLORS`（`config/theme-colors.ts`）皆已就緒。

約束：

- 後台已由 `proxy.ts` 與 `app/(admin)/layout.tsx` 的 `auth()` 雙重守門；Server Action 內仍須自行驗證 session（不可假設僅由 UI 觸發）。
- Server Components 優先，`"use client"` 僅用於表單互動。
- Server Action 統一回傳 `ActionResponse`，多表寫入用 `$transaction`（本次僅單表 `Event`，不需要）。
- 繁體中文註解與檔頭區塊。

## Goals / Non-Goals

**Goals:**

- 提供建立與編輯活動的 Server Action，含 session 守門、Zod 驗證、`revalidatePath`。
- 提供一個 create/edit 共用的表單 client component，欄位對齊 `eventSchema`，含 10 組主題色選擇器與即時票面預覽。
- 新增 `/events/new`、`/events/[id]/edit` 頁面，並從儀表板加入進入點。

**Non-Goals:**

- 刪除活動（不在本次範圍）。
- 票券批次（團體票/早鳥票）的建立與匯出、Email 寄發、QR 渲染。
- 變更 Prisma schema 或認證流程。
- 主視覺檔案上傳（`keyVisualUrl` 維持貼網址，不做檔案上傳）。

## Decisions

### 1. 單一表單元件同時服務 create 與 edit
`event-form.tsx` 接收 optional 的 `defaultValues` 與 `eventId`：有 `eventId` 走 `updateEvent`，否則走 `createEvent`。
- **理由**：兩種情境欄位完全相同，避免重複維護；RHF 的 `defaultValues` 天然支援預填。
- **替代方案**：分成兩個元件 — 否決，徒增重複。

### 2. 兩支獨立 Server Action（`createEvent` / `updateEvent`）放在 `app/(admin)/events/actions.ts`
兩者皆 `"use server"`，流程：`auth()` 驗證 session → `eventSchema.safeParse` → Prisma 寫入 → `revalidatePath("/")` → 回傳 `ok()`/`fail()`。`updateEvent` 額外接 `id`。
- **理由**：與專案既定 Server Action 慣例一致；驗證失敗時 `fail()` 帶 `errors` 供表單顯示欄位錯誤。
- **替代方案**：單一 `upsertEvent(id?)` — 否決，語意較模糊且 revalidate/redirect 行為略有差異。

### 3. 日期時間欄位以 `datetime-local` input 承接，Server 端用 `z.coerce.date()` 轉換
`eventSchema` 已是 `z.coerce.date()`，可吃 `datetime-local` 的字串。表單預填時把 `Date` 轉為本地 `yyyy-MM-ddTHH:mm`。
- **理由**：免引入額外日期套件，符合 Mobile-First 原生控件體驗。
- **風險見下**（時區）。

### 4. 主題色選擇器以 `getThemeColorOptions()` 驅動，即時預覽淺底深色票面
選色時套用對應 `bg`/`text`/`accent` class 呈現迷你票面預覽。
- **理由**：`config/theme-colors.ts` 已是唯一來源，選擇器與票券頁共用同組 class，視覺一致。

### 5. 提交採 client 呼叫 Server Action + `useTransition`，成功後 `router.push("/")`
表單為 client component，透過 RHF `handleSubmit` 呼叫 action，依 `ActionResponse.success` 決定導頁或顯示錯誤。
- **理由**：需要顯示欄位/全域錯誤與 pending 狀態，純 `<form action>` 較難回填 Zod 欄位錯誤。

## Risks / Trade-offs

- **時區**：`datetime-local` 為使用者本地時間，`new Date(string)` 以本地時區解讀後存為 UTC；列表以 `toLocaleString("zh-TW")` 顯示。單一時區管理者情境下一致，跨時區則可能有偏差。→ 緩解：本次管理者為單一團隊，暫不處理多時區；如需要再於後續 change 統一以 UTC + 顯示時區處理。
- **`keyVisualUrl` 僅驗證 URL 格式、不驗證可達性**，可能填入失效連結。→ 緩解：票券頁對主視覺缺失需有 fallback（已在票面設計範圍，非本次）。
- **編輯既有活動會即時影響已發出的票面顯示**（標題、時間、主題色）。這是預期行為（場次資訊更正），但管理者需知情。→ 緩解：在編輯頁加註提示文字。
- **無樂觀鎖**：兩名管理者同時編輯同一活動會後寫覆蓋前寫。→ 緩解：管理者極少且場次僅四個，風險可接受，暫不引入 version 欄位。
