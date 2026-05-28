## Why

目前後台 UI 全為手刻 Tailwind，缺少一致的元件系統與設計 tokens：程式已使用 `text-muted-foreground`、`bg-accent` 等 shadcn 風格 class，但 `app/globals.css` 並未定義這些變數，樣式無法正確解析。導入 shadcn/ui 可建立一致的元件基礎與主題色，並以官方 `dashboard-01`、`login-01` 區塊快速取得專業的後台布局與登入頁樣式。

## What Changes

- **導入 shadcn/ui 基礎**：以 `npx shadcn@latest init` 初始化（套用主題 preset `b4hsKOQCn`），產生 `components.json`、`components/ui/`，並於 `app/globals.css` 補齊設計 tokens（background / foreground / primary / muted / accent / border…，含深色）。對齊既有 `lib/utils.ts` 的 `cn`。
- **後台布局改用 dashboard 區塊**：以 `npx shadcn@latest add dashboard-01` 取得側邊欄 + 頂列的後台 shell，改寫 `app/(admin)/layout.tsx`；**側邊欄僅放單一導覽項「活動場次」**（連至 `/`）。保留既有 session 二次驗證、使用者 Email 與登出 Server Action，移除區塊附帶的 demo 內容（圖表、資料表等）。
- **登入頁樣式參考 login-01**：以 `npx shadcn@latest add login-01` 為參考，重新樣式化 `app/login/page.tsx`；**保留** Google OAuth `signIn` Server Action 與白名單錯誤提示行為。
- **固定淺色**：僅採用主題的淺色 tokens，不提供深色切換。
- **既有手刻元件改用 shadcn 原語**：`app/(admin)/page.tsx`（活動卡片）、`event-form.tsx`、`group-batch-form.tsx`、`batch-section.tsx`、登入頁等，改用 `Button` / `Input` / `Textarea` / `Label` / `Card` / `Sidebar` 等元件，移除手刻樣式。行為（驗證、Server Action 呼叫、欄位錯誤回填）維持不變。
- **新增 shadcn 依賴**：radix-ui 元件、`lucide-react`、`class-variance-authority`、Tailwind v4 動畫工具等（由 CLI 帶入）。
- **不變更**：票券業務邏輯、資料層、Server Actions 行為、序號/批次規則、公開票券頁 `/t/[token]`、票面 10 色主題（`config/theme-colors.ts` 與 UI chrome 主題各自獨立）。

## Capabilities

### New Capabilities
- `admin-ui`: 後台 UI 基礎與外觀 —— shadcn/ui 元件與設計 tokens（主題色、淺/深色）、後台側邊欄導覽布局、登入頁一致樣式。

### Modified Capabilities
<!-- event-management 等行為需求不變，本變更僅換外觀/布局，不改既有 capability 的行為。 -->

## Impact

- **新增**：`components.json`、`components/ui/*`、（dashboard/login 區塊帶入的元件）。
- **`app/globals.css`**：套用 preset 主題 tokens（取代現有極簡 background/foreground 設定）。
- **`app/(admin)/layout.tsx`**：改為 dashboard shell（側邊欄單一項「活動場次」+ 頂列），保留 auth 與登出。
- **`app/login/page.tsx`**：套用 login-01 樣式，保留 OAuth 行為。
- **`app/layout.tsx`**：固定淺色，不加深色切換（必要時僅調整字型/根 class）。
- **`package.json` / `package-lock.json`**：新增 shadcn 相依套件。
- **既有手刻元件改用 shadcn 原語（本次範圍內）**：`app/(admin)/page.tsx`、`event-form.tsx`、`group-batch-form.tsx`、`batch-section.tsx`、`app/login/page.tsx`。

## 已確認決策

1. 固定淺色，不提供深色切換。
2. 既有手刻表單/卡片一併改用 shadcn 原語（範圍見 Impact）。
3. 後台採側邊欄 shell，側邊欄僅單一導覽項「活動場次」。

## 待處理風險（apply 階段）

1. **CLI 指令需先驗證**：你提供的 `init --template next` 中的 `--template` 通常用於**建立新專案**；既有專案就地初始化應省略，改用 `npx shadcn@latest init --preset b4hsKOQCn`。執行 init（會改動 `globals.css`、新增依賴，屬較大動作）前我會再跟你確認正確指令。
2. **相容性**：Tailwind v4 + React 19 + Next 16，採 shadcn 最新版（支援 v4 CSS-first）；`dashboard-01` / `login-01` 區塊可能附 demo 內容或假設設定，需裁剪調整。
