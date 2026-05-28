## Why

後台目前只能在儀表板「列出」活動場次（`app/(admin)/page.tsx`），尚無任何建立或編輯活動的入口。資料層（`lib/data/events.ts`）、Zod schema（`lib/schemas/event.ts`）與 `Event` model 都已備妥，但缺少把它們串起來的 Server Action 與表單 UI，管理者無法自行維護場次資訊。這是後台可用的第一道關卡。

## What Changes

- 新增 **建立活動** 與 **編輯活動** 兩支 Server Action，遵循專案慣例：驗證 session → Zod 驗證輸入（`eventSchema`）→ Prisma 寫入 → `revalidatePath()` → 回傳 `ActionResponse`。
- 新增可重用的 **活動表單 client component**（React Hook Form + Zod resolver），涵蓋欄位：標題、主視覺網址（選填）、地點、活動時間、注意事項、主題色（10 組選擇器）。
- 新增後台頁面 **新增活動**（`/events/new`）與 **編輯活動**（`/events/[id]/edit`），並從儀表板加入進入點（新增按鈕、每張卡片的編輯連結）。
- 表單採 Mobile-First 版面，主題色選擇器即時預覽淺底深色票面風格。
- 編輯僅作用於 `Event` 本身的場次資訊；不涉及票券批次（批次仍維持「新增不修改」原則，不在本次範圍）。

## Capabilities

### New Capabilities
- `event-management`: 管理者於後台建立與編輯活動場次的完整流程，包含表單欄位驗證、主題色選擇、Server Action 寫入與列表/編輯頁的導覽串接。

### Modified Capabilities
<!-- 無既有 spec，無需求層級的既有能力被修改 -->

## Impact

- **新增程式碼**
  - Server Actions：`app/(admin)/events/actions.ts`（`createEvent` / `updateEvent`）
  - 表單元件：`app/(admin)/events/event-form.tsx`（client）
  - 頁面：`app/(admin)/events/new/page.tsx`、`app/(admin)/events/[id]/edit/page.tsx`
- **修改程式碼**
  - `app/(admin)/page.tsx`：加入「新增活動」按鈕與每筆場次的編輯連結
  - 可能擴充 `config/theme-colors.ts` 的 `getThemeColorOptions()` 供選擇器使用（已存在，視需要）
- **依賴**：使用既有 `react-hook-form` + `@hookform/resolvers` + `zod`；無新增套件
- **資料層**：沿用 `lib/data/events.ts`（`getEventById`）；不變更 Prisma schema
- **不影響**：公開票券頁 `/t/[token]`、認證流程、票券批次與流水號邏輯
