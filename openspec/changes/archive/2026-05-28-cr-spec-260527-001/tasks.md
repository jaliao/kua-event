## 1. Zod Schema

- [x] 1.1 `lib/schemas/batch.ts`：`groupBatchSchema`，`groupName` 必填（`min(1)`、`trim`）、`quantity` 正整數（`int`、`min(1)`、`max(500)`）

## 2. 資料層

- [x] 2.1 `lib/data/batches.ts`：`getBatchesByEvent(eventId)` 取該活動團體票批次（含票券數），依建立時間排序
- [x] 2.2 `getBatchWithTickets(batchId)` 取單一批次與其票券（匯出用）

## 3. 票券網址工具

- [x] 3.1 `lib/ticket-url.ts`：`ticketUrl(token)` 以 `NEXT_PUBLIC_APP_URL` 組 `/t/{token}`（重用既有環境變數，不新增變數）

## 4. Server Action

- [x] 4.1 `app/(admin)/events/[id]/batches/actions.ts`：`createGroupBatch(eventId, input)`
- [x] 4.2 驗證 session → Zod 驗證 → 查 `event.code`（查無回 fail）
- [x] 4.3 單一 `$transaction`：`tx.ticketBatch.create`（`type=GROUP`、`groupName`、`quantity`）→ 迴圈 `nextTicketSerial(tx, eventId, code)` 逐張 `tx.ticket.create`（`batchId`、`eventId`、`type=GROUP`、`groupName`、`serialNo`）
- [x] 4.4 `revalidatePath` 活動編輯頁 → 回 `ActionResponse`

## 5. Excel 匯出

- [x] 5.1 安裝 `exceljs` 依賴
- [x] 5.2 `lib/excel.ts`：以 exceljs 產生四欄工作表（序號、票券網址、領票人姓名、領票人 Email），回傳 Buffer；僅 server 端使用
- [x] 5.3 `app/(admin)/events/[id]/batches/[batchId]/export/route.ts`：GET，驗證 session → `getBatchWithTickets` → 寫 xlsx → 回 `Response`，`Content-Type` xlsx + `Content-Disposition: attachment`（檔名以 `encodeURIComponent` 處理中文）
- [x] 5.4 不存在的批次回 404；無 session 回 401

## 6. UI

- [x] 6.1 `app/(admin)/events/[id]/batches/group-batch-form.tsx`（client）：RHF + `zodResolver(groupBatchSchema)`，呼叫 `createGroupBatch`，回填欄位錯誤、成功後 `router.refresh()`
- [x] 6.2 在活動編輯頁底部掛批次清單區塊（Server Component）：以 `getBatchesByEvent` 列團體名稱、數量、建立時間，每筆附匯出連結；空狀態提示
- [x] 6.3 批次清單不提供編輯／刪除入口（additive 原則）

## 7. 驗證

- [x] 7.1 `npm run build` 通過（TypeScript + route 檢查）
- [x] 7.2 手動驗證：建立批次產生連續序號 `{CODE}{seq:4}`、批次出現在清單、匯出 .xlsx 四欄正確（領票人兩欄空白、網址為 `{APP_URL}/t/{token}`）— 待使用者於 dev server + 登入後驗證
- [x] 7.3 手動驗證：團體名稱缺漏／數量 0 或超上限皆回欄位錯誤；交易失敗不留半套 — 待使用者驗證
