## Context

後台 UI 全為手刻 Tailwind，無元件系統與設計 tokens（程式已用 `text-muted-foreground`、`bg-accent` 但 `globals.css` 未定義）。本變更導入 shadcn/ui：套用主題 preset、以 `dashboard-01` 建後台側邊欄 shell、以 `login-01` 為登入頁樣式參考，並將既有手刻元件改用 shadcn 原語。技術環境：Next 16 App Router、React 19、Tailwind v4（CSS-first，`@import "tailwindcss"` + `@theme inline`）、`lib/utils.ts` 已有 `cn`（clsx + tailwind-merge）。

固定淺色、側邊欄僅單一導覽項「活動場次」、元件全面遷移。行為（auth、Server Actions、Zod 驗證、序號/批次）一律不變。

## Goals / Non-Goals

**Goals:**

- 以 shadcn 最新版在「既有專案」就地 init，套用 preset `b4hsKOQCn` 的淺色主題 tokens 至 `app/globals.css`。
- 後台 `app/(admin)/layout.tsx` 改為 dashboard shell（`SidebarProvider` + `AppSidebar` + `SidebarInset` + 頂列），側邊欄單一項「活動場次」→ `/`，頂列含使用者 Email 與登出。
- 登入頁以 login-01 樣式（`Card` + `Button`）重寫，保留 Google OAuth Server Action 與白名單錯誤提示。
- 既有元件改用 shadcn 原語：活動卡片、`event-form`、`group-batch-form`、`batch-section`、登入頁。

**Non-Goals:**

- 深色模式 / 主題切換。
- 票券業務邏輯、資料層、Server Actions 行為、序號/批次規則變更。
- 票面 10 色主題（`config/theme-colors.ts`）改動 —— 與 UI chrome 主題各自獨立。
- 公開票券頁 `/t/[token]` 改版。

## Decisions

### 1. init 指令：省略 `--template`，就地初始化
採 `npx shadcn@latest init --preset b4hsKOQCn`（**不帶** `--template next`，該旗標用於建立新專案）。CLI 偵測 Next + Tailwind v4，產生 `components.json`、改寫 `app/globals.css`（注入 preset 淺色 tokens 與 `@theme` 對應）、新增依賴（`lucide-react`、`class-variance-authority`、`tw-animate-css` 等；`clsx`/`tailwind-merge` 已有）。
- `components.json` aliases：`utils` → `@/lib/utils`（沿用既有）、`ui` → `@/components/ui`、`components` → `@/components`。
- **執行前確認**：init 會覆寫 `globals.css`、動 `package.json`，屬較大動作，apply 時先與使用者確認指令再跑；跑後檢視 `globals.css` 差異。
- **替代**：手動建 `components.json` + 貼 tokens —— 否決，CLI 較不易出錯且能正確處理 v4。

### 2. 淺色固定：只保留 light tokens
preset 若輸出 `.dark { … }` 區塊，保留無妨但**不掛載** `dark` class，根 `html` 維持淺色；不引入 ThemeProvider。`app/layout.tsx` 僅保留既有 Geist 字型設定。

### 3. dashboard-01 只取 shell，裁掉 demo
`npx shadcn@latest add dashboard-01` 會帶入 `ui/sidebar` 等元件與一批 demo（`chart-area-interactive`、`data-table`、`section-cards`、示範 `app/dashboard/page.tsx`）。**只保留** shell 構件（`SidebarProvider`、`AppSidebar`、`SidebarInset`、`site-header`、`nav-*`），刪除 demo 頁與圖表/資料表元件。
- `AppSidebar`：導覽改為單一項「活動場次」（icon + label）連 `/`；移除多餘群組。
- `nav-user` / 頂列：顯示登入者 Email，登出沿用既有 `signOut` Server Action（包成 form/Button）。
- **權衡**：dashboard-01 會一併裝圖表/表格相依（recharts、tanstack table 等）；刪 demo 後這些成為未使用依賴 —— apply 時評估移除未用套件，或接受保留（見 Risks）。
- **替代**：改用 `add sidebar` 自建 shell —— 否決，使用者明確指定 dashboard-01。

### 4. login-01 作為樣式參考，保留我方 auth 邏輯
`add login-01` 會帶 `login-form` 並可能覆寫 `app/login/page.tsx`（其為 client demo）。我方登入頁是 Server Component + `signIn` Server Action + 白名單錯誤。作法：取其 `Card`/`Button`/版面樣式，**重寫**我方 `app/login/page.tsx`，保留 Server Action 與 `error === "NotWhitelisted"` 提示；不直接沿用 demo 頁邏輯。
- **理由**：避免遺失白名單/OAuth 行為。

### 5. 元件遷移對應
新增 `ui` 原語：`button`、`input`、`textarea`、`label`、`card`（`sidebar` 由 dashboard-01 帶入）。逐檔改寫：
- `app/(admin)/page.tsx`：卡片改 `Card`/`CardHeader`/`CardContent`；操作列三入口用 `Button asChild` 包 `Link`。**保留**每場次票面主題色（`theme.bg/text/accent`）套在 `Card` 的 `className`，與 shadcn token 並存。
- `event-form.tsx`：欄位改 `Input`/`Textarea`/`Label`、送出 `Button`；RHF + `zodResolver` 與錯誤回填不變；10 色選擇器維持自訂 swatch。
- `group-batch-form.tsx`：`Input`/`Label`/`Button`。
- `batch-section.tsx`：批次清單項用 `Card`，匯出用 `Button asChild`。
- `app/login/page.tsx`：`Card` + `Button`。

### 6. 驗證
`npm run build`（TS + route）為主要關卡。手動驗證：登入頁、後台 shell（側邊欄/登出）、活動卡片與三入口、表單建立/編輯、團體票建立/匯出 —— 外觀更新且行為不回歸。

## Risks / Trade-offs

- **CLI 覆寫 `globals.css`** → init 後檢視差異，確保既有必要設定（字型 var）不遺失；淺色 tokens 正確注入。
- **dashboard-01 帶入未用相依**（recharts、tanstack table 等）→ 刪 demo 元件後評估 `npm remove` 未用套件，或接受保留（不影響 build，僅體積）。
- **`add login-01` 覆寫登入頁** → 不直接採用 demo 頁，改以樣式參考重寫，保留 auth 邏輯。
- **Tailwind v4 區塊相容** → 採 shadcn 最新版；若區塊假設 `tailwind.config`，以 v4 CSS-first 調整（本專案無 tailwind.config）。
- **票面主題色與 shadcn token 並存** → 卡片同時帶 product 主題色與 shadcn 結構樣式，需確認對比/可讀性不受影響。
- **React 19 peer deps** → 採最新 radix 版本，留意 install 警告。

## Migration Plan

純前端/樣式 + 依賴調整，無 DB 變更。順序：init（確認指令）→ 加 ui 原語 → add dashboard-01 取 shell、裁 demo → add login-01 取樣式 → 逐檔遷移元件 → `npm run build` → 手動驗證。回滾＝還原 `globals.css`、`components.json`、`components/`、受改頁面與 `package.json`。

## Open Questions

- 無（淺色、側邊欄單一項、全面遷移、登入參考 login-01 已定案）。`init` 指令會在 apply 執行前再確認。
