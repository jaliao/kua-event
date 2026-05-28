## 1. Prisma Schema 與 Migration

- [x] 1.1 `prisma/schema/event.prisma`：`Event` 新增 `code String @unique`（暫先可空以利回填）
- [x] 1.2 `TicketCounter` 改為 per-event：移除 `type` 欄位與 `@@unique([eventId, type])`，改為 `@@unique([eventId])`（或 `eventId @unique`）
- [x] 1.3 全域搜尋 `TicketCounter.type` 引用點，確認無其他程式依賴
- [x] 1.4 `npm run db:migrate` 產生 migration；分步處理：加欄位（nullable）→ 回填既有四場次代號 → 設 `NOT NULL` + `UNIQUE`
- [x] 1.5 `npm run db:generate` 重新產生 Prisma client

## 2. 序號產生器

- [x] 2.1 `lib/serial.ts`：`nextTicketSerial` 改簽章為 `(tx, eventId, code)`，移除 `TicketType` 參數與 E/G 前綴
- [x] 2.2 計數器 upsert 改以 `eventId` 為鍵，回傳 `${code}${seq:4}`（四位補零）
- [x] 2.3 更新檔頭註解的格式說明（例 `NY010001`）

## 3. Schema 與表單

- [x] 3.1 `lib/schemas/event.ts`：`eventSchema` 新增 `code`（`min(1)` 必填、`regex /^[A-Za-z0-9]+$/`、`transform` 轉大寫、合理 `max`）
- [x] 3.2 `app/(admin)/events/event-form.tsx`：新增活動代號輸入欄（置於標題上方或首欄），欄位下方加註填寫說明（英數、自動大寫、例 NY01）
- [x] 3.3 編輯頁 `defaultValues` 帶入 `event.code`

## 4. Server Action

- [x] 4.1 `app/(admin)/events/actions.ts`：`createEvent` / `updateEvent` 的 `normalize` 納入 `code`
- [x] 4.2 捕捉 Prisma `P2002`（unique 違反）→ `fail()` 帶 `code` 欄位錯誤「活動代號已被使用」

## 5. Seed

- [x] 5.1 `prisma/seed.ts`：四個既有場次補上 `code`（依命名規則，如 NYE1/NYL1/LAE1/LAL1，待使用者確認）

## 6. 驗證

- [x] 6.1 `npm run build` 通過（TypeScript + route 檢查）
- [x] 6.2 手動驗證：建立活動含代號（小寫自動轉大寫）、格式錯誤與重複代號皆回報欄位錯誤
- [x] 6.3 手動驗證：產生票券編號為 `{CODE}{seq:4}`，同活動跨票種流水號連續、不同活動各自從 0001
