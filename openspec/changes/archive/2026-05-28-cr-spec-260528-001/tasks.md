## 1. 資料層：活動票券分項計數

- [x] 1.1 `lib/data/events.ts`：`getEvents` 取活動後，以單一 `prisma.ticket.groupBy({ by: ["eventId", "type"], _count: { _all: true } })` 取得各活動每票種張數
- [x] 1.2 於記憶體合併進活動清單，回傳每筆活動帶 `counts: { total, group, earlyBird }`；groupBy 未涵蓋的活動補 0
- [x] 1.3 確認回傳型別供儀表板使用（含 `counts`）

## 2. 儀表板卡片改版

- [x] 2.1 `app/(admin)/page.tsx`：卡片改顯示活動代號、活動名稱、活動日期，移除活動地點
- [x] 2.2 卡片顯示票券張數：總張數 + 團體票 / 早鳥票分項（如「票券 12 張（團體 12 ／ 早鳥 0）」）
- [x] 2.3 卡片底部操作列三入口：編輯（`/events/[id]/edit`）｜團體票（`/events/[id]/batches`）｜早鳥票（`/events/[id]/early-bird`），Mobile-First 可換行
- [x] 2.4 維持既有主題色卡片樣式

## 3. 團體票獨立頁

- [x] 3.1 新增 `app/(admin)/events/[id]/batches/page.tsx`：Server Component，以 `getEventById` 取活動（查無 `notFound`），顯示頁首（代號 + 標題 + 返回）並內嵌既有 `BatchSection`
- [x] 3.2 `app/(admin)/events/[id]/edit/page.tsx`：移除 `BatchSection` 與其 import（編輯頁僅留活動基本資料）
- [x] 3.3 `app/(admin)/events/[id]/batches/actions.ts`：`createGroupBatch` 的 `revalidatePath` 由 `/events/${eventId}/edit` 改為 `/events/${eventId}/batches`

## 4. 早鳥票佔位頁

- [x] 4.1 新增 `app/(admin)/events/[id]/early-bird/page.tsx`：Server Component，以 `getEventById` 取活動（查無 `notFound`），顯示頁首 + 「早鳥票功能尚未開放（開發中）」說明 + 返回入口，無任何上傳/寄發操作

## 5. 驗證

- [x] 5.1 `npm run build` 通過（TypeScript + route 檢查）
- [x] 5.2 手動驗證：儀表板卡片顯示代號/名稱/日期與票券三項計數（零票顯示 0）；三入口導向正確 — 待使用者於 dev server + 登入後驗證
- [x] 5.3 手動驗證：團體票頁可建立批次/看清單/匯出，建立後清單即時刷新；編輯頁不再出現批次區塊 — 待使用者驗證
- [x] 5.4 手動驗證：早鳥票頁顯示未開放說明、無操作 — 待使用者驗證
