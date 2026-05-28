## Why

團體票的核心流程目前完全缺席：管理者無法為活動建立團體票批次，也無法把批次匯出成 Excel 交給團體窗口分派。資料模型（`TicketBatch`、`Ticket`、`TicketCounter`）與序號產生器（`lib/serial.ts`）已備妥，但沒有任何 Server Action 或 UI 把它們串起來。這是團體票業務上線的關鍵一環。

## What Changes

- 新增 **建立團體票批次** Server Action：輸入團體名稱 + 數量 → 在單一 `$transaction` 內建立一筆 `TicketBatch`，並逐張產生對應數量的 `Ticket`（`serialNo` 經 `nextTicketSerial` 原子遞增、`accessToken` 自動產生、`groupName` 帶入）。
- 批次為 **additive**：追加票數時建立「另一筆」批次，**永不修改**既有批次（無編輯/刪除批次的入口）。
- 新增 **批次列表/管理 UI**：在活動底下顯示既有團體票批次（團體名稱、數量、建立時間），並提供建立新批次的表單入口。
- 新增 **Excel 匯出**：將指定批次匯出為 `.xlsx`，欄位為「序號、票券網址、領票人姓名（空白）、領票人 Email（空白）」，後兩欄留空供窗口自行填寫。
- 票券網址以 **環境變數 base URL**（`NEXT_PUBLIC_*`）組合 `/t/[token]` 產生。
- 新增 `exceljs` 依賴。

## Capabilities

### New Capabilities
- `group-ticket-batch`: 團體票批次的建立（additive、不可修改）、批次內票券的原子產生與序號配置、批次清單呈現，以及批次匯出 Excel（序號 / 票券網址 / 空白領票人欄）。

### Modified Capabilities
<!-- 無既有 capability 的需求被修改；event-management 不變 -->

## Impact

- **新增程式碼**
  - Server Action：`app/(admin)/events/[id]/batches/actions.ts`（`createGroupBatch`）
  - 匯出：`app/(admin)/events/[id]/batches/[batchId]/export/route.ts`（Route Handler，回傳 .xlsx）或等效 Server Action + download
  - 表單元件：`app/(admin)/events/[id]/batches/group-batch-form.tsx`（client）
  - 頁面/區塊：在活動編輯或詳情頁顯示批次清單與建立表單
  - Zod schema：`lib/schemas/batch.ts`（團體名稱必填、數量為正整數上限約束）
  - 資料層：`lib/data/batches.ts`（`getBatchesByEvent`、`getBatchWithTickets`）
  - Excel 工具：`lib/excel.ts`（以 exceljs 產生工作表）
  - 設定：`config/` 或 `lib/` 取得 base URL 的小工具（讀 `NEXT_PUBLIC_*`）
- **新增依賴**：`exceljs`
- **環境變數**：新增票券網址 base（如 `NEXT_PUBLIC_TICKET_BASE_URL`），更新 `.env.example`
- **沿用**：`lib/serial.ts`、`prisma.$transaction`、`ActionResponse`、`TicketType.GROUP`
- **不影響**：早鳥票流程、公開票券頁 `/t/[token]`、認證、`event-management`
- **不變更 Prisma schema**（既有模型已足夠）
