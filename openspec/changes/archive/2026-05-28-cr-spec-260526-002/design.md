## Context

票券編號要從 `{eventId}-{E|G}-{seq:4}` 改為「活動代號 + 四位流水號」（如 `NY010001`）。活動代號是 `Event` 上的新欄位，由管理者輸入。現行 `TicketCounter` 為 per (event+type)，在新格式下早鳥/團體會撞號，須改為 per-event。既有資料：seed 建立的四個場次需回填代號；目前資料庫尚在開發階段（無正式票券資料需保號）。

涉及：`prisma/schema/event.prisma`、`lib/serial.ts`、`lib/schemas/event.ts`、`app/(admin)/events/*`、`prisma/seed.ts`。下游 `cr-spec-260527-001`（團體票批次）尚未實作，會直接採用新規則。

## Goals / Non-Goals

**Goals:**

- `Event` 取得唯一、必填、英數、自動大寫的 `code`。
- 票券編號為 `{CODE}{seq:4}`，每活動單一計數器、跨票種共用、自 0001 起。
- 建立/編輯活動表單與 Server Action 納入 `code`，含唯一衝突處理。
- 既有四場次與 seed 補上代號。

**Non-Goals:**

- 變更票券網址機制（維持 `accessToken`）。
- 團體票批次／早鳥票流程本身（屬其他 change）。
- 既有正式票券的歷史編號遷移（開發期無正式資料）。

## Decisions

### 1. `Event.code`：`String @unique`，必填
Zod 於應用層驗證格式（`^[A-Za-z0-9]+$`、轉大寫），DB 以 `@unique` 保證唯一。
- **理由**：格式規則屬商業驗證放 Zod；唯一性屬資料完整性放 DB。
- **替代方案**：DB 端 check constraint 驗格式 — 否決，Prisma 對 check constraint 支援有限且錯誤訊息不友善。

### 2. 大寫正規化在 Zod `transform` 完成
`code: z.string().regex(/^[A-Za-z0-9]+$/, "僅限英文與數字").transform((v) => v.toUpperCase())`，並加 `min(1)` 必填與合理 `max`。
- **理由**：前後端共用 schema，輸入大小寫皆可、儲存一律大寫，比對唯一性一致。
- **注意**：表單即時顯示可另在 UI 層 `onChange` 轉大寫提升體感，但真實來源以 server transform 為準。

### 3. `TicketCounter` 改為 per-event 單一計數器
將唯一鍵由 `@@unique([eventId, type])` 改為以 `eventId` 唯一（移除 `type` 維度，或保留 `type` 欄位但不入鍵）。選擇**移除 type 維度**：`@@unique([eventId])`，並把 `type` 欄位移除。
- **理由**：新編號無類型區分，counter 不應再分型；保留 type 欄位只會誤導。
- **替代方案**：保留 `type` 但所有票種傳同一值 — 否決，語意混亂。

### 4. `nextTicketSerial` 改簽章：以 event `code` 組號
新簽章 `nextTicketSerial(tx, eventId, code)`：upsert per-event counter → `${code}${seq:4}`。移除 `TicketType` 參數與 E/G 前綴。
- **理由**：呼叫端（團體票/早鳥票）只需提供活動 id 與代號；類型不再影響編號。
- **替代方案**：函式內自行查 `Event.code` 只收 eventId — 可行，但多一次查詢；交由呼叫端傳入（多半已有 event 物件）較省。權衡後採「傳入 code」，呼叫端若無 code 再自行查。

### 5. Migration 與既有資料回填
新增 migration：`Event.code` 先以 nullable 加入 → 回填四場次代號（NY/LA × 早/晚對應，如 `NYE1`/`NYL1`/`LAE1`/`LAL1` 或依實際命名）→ 設為 `NOT NULL` + `UNIQUE`；`TicketCounter` 調整唯一鍵與移除 type。同步更新 `prisma/seed.ts`。
- **理由**：開發期資料少，可安全回填；分步驟避免 NOT NULL 對既有列失敗。
- **風險見下**。

### 6. 唯一衝突回傳欄位錯誤
create/update 捕捉 Prisma `P2002`（unique 違反）→ `fail()` 帶 `code` 欄位錯誤「活動代號已被使用」。
- **理由**：把 DB 唯一衝突轉成表單可顯示的欄位錯誤，與 Zod 錯誤一致呈現。

## Risks / Trade-offs

- **NOT NULL + UNIQUE 對既有列**：直接加會因既有列無值而失敗。→ 緩解：migration 分步（nullable → 回填 → NOT NULL/UNIQUE），或開發期可重置 DB。
- **下游 change 依賴順序**：`cr-spec-260527-001` 若在本變更前實作會用到舊 `nextTicketSerial` 簽章。→ 緩解：先套用本變更；其 design 已註明依賴。
- **既有票券沿用舊編號**：若資料庫已有以舊格式產生的票券，編號不會自動轉換。→ 緩解：開發期無正式票券；如有則屬一次性資料遷移，另案處理。
- **代號可被推測**（如 NY01）但**網址仍以 accessToken**，編號不用於存取，無資安暴露。→ 確認：匯出/顯示用編號，存取一律 token。
- **type 欄位移除影響**：確認除 counter 外無其他程式依賴 `TicketCounter.type`。→ 緩解：實作時全域搜尋引用點。

## Open Questions

- 四個既有場次的實際代號命名（如 `NYE1`/`NYL1`/`LAE1`/`LAL1`）待確認；實作 seed 時以此為準，可由使用者指定。
