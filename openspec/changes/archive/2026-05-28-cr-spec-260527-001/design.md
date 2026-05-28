## Context

團體票業務需要：管理者為某活動建立「團體名稱 + 數量」的批次，系統據此產生對應張數的 `Ticket`，再把批次匯出成 Excel 交給窗口分派。既有零件：`TicketBatch`／`Ticket`／`TicketCounter` 模型、`nextTicketSerial(tx, eventId, type)`（須在 `$transaction` 內呼叫）、`ActionResponse`、公開票券頁 `/t/[token]`（以 `accessToken` 驅動）。

約束：

- 團體票批次為 **additive**：建立後永不修改、不刪除；追加票數一律另建批次。
- 序號須 per event+type 原子遞增，故批次與其票券的建立必須在 **單一 `$transaction`** 內完成。
- 全程免驗票；`accessToken` 即公開網址 token。
- Server Action 自行驗證 session；統一回傳 `ActionResponse`。
- Excel 以 `exceljs` 產生；票券網址以 `NEXT_PUBLIC_*` base URL 組合。

## Goals / Non-Goals

**Goals:**

- 提供 `createGroupBatch` Server Action：單一 `$transaction` 建立 `TicketBatch` + N 張 `Ticket`（序號原子遞增、`accessToken`、`groupName` 帶入）。
- 在活動底下呈現團體票批次清單與建立表單入口。
- 提供批次 Excel 匯出（序號 / 票券網址 / 空白領票人姓名 / 空白領票人 Email）。

**Non-Goals:**

- 早鳥票（名單上傳 + Email 寄發）。
- 編輯或刪除既有批次／票券。
- QR Code 渲染、票面視覺。
- 票券逐張的領票人即時編輯（Excel 由窗口離線填寫，不回寫系統）。
- 變更 Prisma schema。

## Decisions

### 1. 批次與票券於單一 `$transaction` 內建立，序號用 `nextTicketSerial`
`createGroupBatch` 在 `prisma.$transaction(async (tx) => {...})` 內先 `tx.ticketBatch.create`，再迴圈呼叫 `nextTicketSerial(tx, eventId, "GROUP")` 逐張 `tx.ticket.create`（帶 `batchId`、`groupName`、`type: GROUP`）。
- **理由**：序號計數器與票券寫入須同一交易，避免併發下序號重複或批次有票數缺漏。
- **替代方案**：`createMany` 一次插入 — 否決，序號需逐張向 counter 取號，`createMany` 無法在同交易內逐筆遞增。

### 2. 數量上限以 Zod 約束（如 1–500）
`lib/schemas/batch.ts`：`groupName` 必填、`quantity` 為正整數且設上限，避免單次交易產生過多票券拖垮交易。
- **理由**：單一交易內逐張建立，數量過大將拉長鎖定時間。上限可後續調整。

### 3. Excel 匯出走 Route Handler，回傳 .xlsx 串流
`app/(admin)/events/[id]/batches/[batchId]/export/route.ts`（GET）：驗證 session → 以 `getBatchWithTickets` 取資料 → `exceljs` 寫入工作表 → 回傳 `Response`，帶 `Content-Disposition: attachment` 與 `Content-Type` 為 xlsx。
- **理由**：檔案下載天然是 GET + 二進位回應，Route Handler 比 Server Action 更直接（Server Action 回傳二進位下載較彆扭）。
- **替代方案**：Server Action 回 base64 再由 client 觸發下載 — 否決，較繞且記憶體成本高。

### 4. 票券網址 base 用 `NEXT_PUBLIC_TICKET_BASE_URL`
匯出時組 `${base}/t/${accessToken}`；新增小工具 `ticketUrl(token)` 集中讀取環境變數，缺值時 fallback 並記錄。
- **理由**：production／test／本地網域不同，集中設定最明確；`NEXT_PUBLIC_` 前綴讓 client 端（若日後需要）也可用。

### 5. Excel 欄位固定四欄
順序：`序號`、`票券網址`、`領票人姓名`、`領票人 Email`。後兩欄留空，供窗口離線填寫。
- **理由**：對齊需求文件；姓名/Email 不回寫系統，純交付用途。

### 6. 批次清單與建立表單掛在活動編輯頁底部（或活動詳情區塊）
重用既有 `/events/[id]/edit` 路由脈絡；批次清單由 Server Component 以 `getBatchesByEvent` 取得，建立表單為 client component 呼叫 `createGroupBatch`。
- **理由**：管理者在同一活動脈絡下建立批次最自然，免另建詳情頁。

## Risks / Trade-offs

- **大量數量造成長交易**：單批數百張票於單一交易內逐張取號 + 寫入，可能鎖 counter 較久。→ 緩解：Zod 數量上限；如未來需更大量，改為分段交易或預先批配號段。
- **base URL 設定缺失**：`NEXT_PUBLIC_TICKET_BASE_URL` 未設時匯出的網址會錯。→ 緩解：`ticketUrl()` 在缺值時用相對路徑或明確報錯，並於 `.env.example` 記載。
- **Excel 中文編碼/檔名**：`Content-Disposition` 檔名含中文需 `filename*=UTF-8''` 編碼。→ 緩解：檔名以批次 id／團體名稱 encodeURIComponent。
- **additive 但無刪除**：誤建批次無法於 UI 移除，只能無視或由 DB 層處理。→ 緩解：建立表單加確認；本次不提供刪除（符合 additive 原則），如需更正另議。
- **exceljs 套件體積**：僅在 server 端（Route Handler）使用，不進 client bundle。→ 確保 import 僅存在於 server 模組。
