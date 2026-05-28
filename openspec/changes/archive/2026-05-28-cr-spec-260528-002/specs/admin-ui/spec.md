## ADDED Requirements

### Requirement: 後台採用 shadcn/ui 與固定淺色主題

後台 UI SHALL 採用 shadcn/ui 元件庫與其設計 tokens（`background`、`foreground`、`primary`、`muted`、`accent`、`border` 等），並於 `app/globals.css` 定義。主題 MUST 固定為淺色，MUST NOT 提供深色切換。

#### Scenario: 設計 tokens 正確解析

- **WHEN** 後台頁面使用 `text-muted-foreground`、`bg-accent` 等 token class
- **THEN** 樣式以 `globals.css` 定義的 tokens 正確呈現（不再為未定義）

#### Scenario: 固定淺色呈現

- **WHEN** 管理者開啟任一後台頁面
- **THEN** 介面一律以淺色主題呈現
- **AND** 不提供深色模式切換

### Requirement: 後台側邊欄 shell

後台 SHALL 以側邊欄 + 頂列 shell 呈現。側邊欄 MUST 含單一導覽項「活動場次」連至 `/`；頂列 MUST 顯示登入者 Email 與登出入口。既有 session 二次驗證行為 MUST 維持不變。

#### Scenario: 顯示側邊欄與導覽

- **WHEN** 已登入管理者進入後台
- **THEN** 顯示側邊欄，含單一導覽項「活動場次」連至 `/`

#### Scenario: 頂列登出

- **WHEN** 管理者於頂列點擊登出
- **THEN** 系統執行 `signOut` 並導回 `/login`

#### Scenario: 未登入仍被導向登入

- **WHEN** 未通過 session 驗證的請求進入後台
- **THEN** 系統導向 `/login`（行為與既有一致）

### Requirement: 登入頁一致樣式

登入頁 SHALL 以卡片式樣式（shadcn `Card` + `Button`）呈現，並 MUST 保留 Google OAuth 登入與白名單錯誤提示行為。

#### Scenario: 顯示卡片式登入

- **WHEN** 未登入使用者開啟 `/login`
- **THEN** 顯示卡片式登入畫面，含系統標題與「使用 Google 登入」按鈕

#### Scenario: 白名單錯誤提示

- **WHEN** 登入導回帶 `error=NotWhitelisted`
- **THEN** 登入頁顯示「此 Email 不在白名單中，無法登入」提示

### Requirement: 後台表單與卡片採用 shadcn 原語

後台既有表單與卡片（活動卡片、活動表單、團體票批次表單與清單）SHALL 改以 shadcn 原語（`Button`、`Input`、`Textarea`、`Label`、`Card`）呈現。元件行為 MUST 維持不變（Zod 驗證、Server Action 呼叫、欄位錯誤回填、票面主題色）。

#### Scenario: 表單行為不回歸

- **WHEN** 管理者於改版後的活動表單或團體票表單提交（含缺漏/錯誤輸入）
- **THEN** 驗證、Server Action 呼叫與欄位錯誤回填行為與改版前一致

#### Scenario: 活動卡片保留主題色

- **WHEN** 儀表板以 `Card` 呈現各活動卡片
- **THEN** 每張卡片仍套用該活動的票面主題色（`bg`/`text`/`accent`）
