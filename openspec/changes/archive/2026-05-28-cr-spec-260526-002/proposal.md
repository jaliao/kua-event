## Why

目前票券編號格式為 `{eventId}-{E|G}-{seq:4}`（如 `12-G-0007`），對外辨識性差且夾帶內部數字 id。業務需要以「活動代號 + 四位流水號」呈現（如 `NY010001`），代號由管理者於建立活動時輸入。此外，現行 `TicketCounter` 為 per event+type，會使早鳥票與團體票在新格式下產生相同編號，必須改為每活動單一計數器。此變更是團體票批次（`cr-spec-260527-001`）落地前的前置條件。

## What Changes

- **Event 新增 `code` 欄位**：活動代號，唯一、必填，僅限英數（不接受符號），輸入時自動轉大寫，例 `NY01`。建立活動時輸入、可於編輯時修改；表單欄位下方加註填寫說明。
- **票券編號格式改為 `{CODE}{seq:4}`**：活動代號緊接四位流水號（如 `NY010001`），不再含內部 id 或類型字母。
- **流水號計數器改為 per-event（共用）**：同一活動的早鳥票與團體票共用一組流水號，自 `0001` 起算；活動之間不共用。`TicketCounter` 由 `@@unique([eventId, type])` 改為以 `eventId` 為單位。**BREAKING**：`lib/serial.ts` 的 `nextTicketSerial` 簽章與計數鍵改變。
- **票券網址維持以 `accessToken`**（非編號）產生，避免以可推測編號暴露票券（本變更僅確認、不更動既有行為）。
- 更新 seed：為四個既有場次指定活動代號。

## Capabilities

### New Capabilities
- `ticket-serial`: 票券編號規則 —— 以活動代號為前綴、每活動單一四位流水號（全活動唯一、跨票種共用），於交易內原子遞增產生。

### Modified Capabilities
- `event-management`: 活動建立與編輯新增「活動代號」必填欄位（唯一、英數、自動大寫），並於表單呈現填寫說明。

## Impact

- **Prisma schema**（`prisma/schema/event.prisma`）
  - `Event` 新增 `code String @unique`
  - `TicketCounter` 由 `@@unique([eventId, type])` 改為 `@@unique([eventId])`（移除 type 維度，或保留欄位但鍵改為 eventId）
  - 需新增 migration；既有資料需回填 `code`
- **`lib/serial.ts`**：`nextTicketSerial` 改以 event `code` 組編號、計數鍵改 per-event；簽章調整（需傳入或查得 code）
- **`lib/schemas/event.ts`**：`eventSchema` 新增 `code` 欄位驗證（regex `^[A-Za-z0-9]+$`、transform 轉大寫、必填）
- **`app/(admin)/events/event-form.tsx`**：新增代號輸入欄 + 說明文字
- **`app/(admin)/events/actions.ts`**：create/update 帶入 `code`；處理唯一衝突回傳欄位錯誤
- **`prisma/seed.ts`**：四場次補上 `code`
- **下游依賴**：`cr-spec-260527-001`（團體票批次）須在本變更套用後再實作，以使用新序號規則
- **不影響**：公開票券頁 `/t/[token]`（仍用 accessToken）、認證
