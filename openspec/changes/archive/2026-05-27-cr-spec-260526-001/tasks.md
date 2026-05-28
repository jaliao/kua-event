## 1. Server Actions

- [x] 1.1 建立 `app/(admin)/events/actions.ts`（`"use server"`，繁中檔頭）
- [x] 1.2 實作 `createEvent(input)`：`auth()` 驗證 session → `eventSchema.safeParse` → `prisma.event.create` → `revalidatePath("/")` → 回傳 `ok()`／`fail()`（帶 Zod 欄位錯誤）
- [x] 1.3 實作 `updateEvent(id, input)`：`auth()` 驗證 → `eventSchema.safeParse` → `prisma.event.update`（僅更新 `Event`，不動批次）→ `revalidatePath("/")` → 回傳 `ActionResponse`
- [x] 1.4 兩支 action 皆在 session 缺失時直接 `fail()`，不依賴 UI／proxy 守門

## 2. 表單元件

- [x] 2.1 建立 client component `app/(admin)/events/event-form.tsx`，以 `react-hook-form` + `zodResolver(eventSchema)` 管理欄位
- [x] 2.2 接收 optional `eventId` 與 `defaultValues`：有 `eventId` 走 `updateEvent`，否則走 `createEvent`
- [x] 2.3 渲染欄位：標題、主視覺網址（選填）、地點、活動時間（`datetime-local`）、注意事項（選填）、主題色
- [x] 2.4 主題色選擇器以 `getThemeColorOptions()` 驅動，選取時即時套用 `bg`/`text`/`accent` 呈現票面預覽
- [x] 2.5 以 `useTransition` 提交，依 `ActionResponse.success` 導回 `/` 或就地回填全域訊息與欄位錯誤
- [x] 2.6 編輯時把 `Event.eventAt`（`Date`）轉為本地 `yyyy-MM-ddTHH:mm` 預填 `datetime-local`
- [x] 2.7 Mobile-First 版面，加註「編輯會影響已發出票面顯示」提示

## 3. 頁面

- [x] 3.1 建立 `app/(admin)/events/new/page.tsx`（Server Component），渲染空白 `EventForm`
- [x] 3.2 建立 `app/(admin)/events/[id]/edit/page.tsx`：以 `getEventById` 取資料，查無則 `notFound()`，否則以現值渲染 `EventForm`
- [x] 3.3 於 `app/(admin)/page.tsx` 加入「新增活動」入口（連 `/events/new`）與每筆場次的編輯連結（連 `/events/[id]/edit`）

## 4. 驗證

- [x] 4.1 `npm run build` 通過（TypeScript + route 檢查）
- [x] 4.2 手動驗證建立流程：必填缺漏、主視覺 URL 格式、主題色越界皆正確回報錯誤；成功後導回儀表板並出現於列表
- [x] 4.3 手動驗證編輯流程：預填正確、更新後列表反映、票券批次不受影響、不存在 id 顯示 not found
