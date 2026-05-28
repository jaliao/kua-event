## 1. 初始化 shadcn（執行前確認指令）

- [x] 1.1 確認 init 指令（使用者確認採 `npx shadcn@latest init --preset b4hsKOQCn --template next`）後執行
- [x] 1.2 檢視 init 對 `app/globals.css` 的改動：淺色 tokens 正確注入（neutral base、radix-luma）、`@theme` 對應完整、字型 var 保留（新增 Public_Sans 作 `--font-sans`）
- [x] 1.3 確認 `components.json` aliases（`utils` → `@/lib/utils`、`ui` → `@/components/ui`）；依賴安裝成功；build 通過

## 2. UI 原語

- [x] 2.1 加入 shadcn 原語：button（init 帶入）+ input/textarea/label/card
- [x] 2.2 確認 `components/ui/*` 產生且 import 路徑可解析（`@/components/ui/...`）

## 3. 後台 shell（dashboard-01）

- [x] 3.1 `npx shadcn@latest add dashboard-01`，保留 shell 構件（`ui/sidebar` 等），刪除 demo（圖表、資料表、section-cards、各 nav-*、site-header、示範 dashboard 頁）
- [x] 3.2 `AppSidebar`：精簡重寫為單一項「活動場次」（icon + label）連 `/`，品牌置於頁首
- [x] 3.3 改寫 `app/(admin)/layout.tsx`：`SidebarProvider` + `AppSidebar` + `SidebarInset` + 頂列（`SidebarTrigger` + Email + 登出 `signOut`）；保留 session 二次驗證；外層 `TooltipProvider`
- [x] 3.4 移除未用相依：刪 `ui/chart.tsx` 並 `npm remove recharts @tanstack/react-table`；其餘 ui 元件為輕量本地檔，保留不影響 build

## 4. 登入頁（login-01 樣式）

- [x] 4.1 以 login-01 卡片置中樣式為參考（add 時其欲覆寫登入頁，為保留 OAuth 邏輯而不覆寫）
- [x] 4.2 重寫 `app/login/page.tsx`：以 `Card` + `Button` 呈現，保留 `signIn("google")` Server Action 與 `error === "NotWhitelisted"` 提示

## 5. 既有元件遷移 shadcn 原語

- [x] 5.1 `app/(admin)/page.tsx`：活動卡片改 `Card`/`CardHeader`/`CardContent`/`CardFooter`，三入口用 `Button asChild` 包 `Link`；保留每場次票面主題色（`theme.bg/text/accent`）
- [x] 5.2 `event-form.tsx`：欄位改 `Input`/`Textarea`/`Label`、送出 `Button`；RHF + `zodResolver` 與錯誤回填不變；10 色 swatch 維持
- [x] 5.3 `group-batch-form.tsx`：改 `Input`/`Label`/`Button`，行為不變
- [x] 5.4 `batch-section.tsx`：批次清單項改 `Card`，匯出改 `Button asChild`

## 6. 驗證

- [x] 6.1 `npm run build` 通過（TypeScript + route 檢查）
- [x] 6.2 手動驗證：登入頁卡片樣式 + Google 登入 + 白名單錯誤提示 — 待使用者於 dev server 驗證
- [x] 6.3 手動驗證：後台側邊欄（單一「活動場次」）、頂列 Email 與登出、未登入導向 /login — 待使用者驗證
- [x] 6.4 手動驗證：活動卡片（主題色 + 三入口）、活動建立/編輯表單、團體票建立/清單/匯出 —— 外觀更新且行為不回歸 — 待使用者驗證
- [x] 6.5 確認固定淺色（無深色切換）、`muted-foreground`/`accent` 等 token 正確呈現 — 待使用者驗證
