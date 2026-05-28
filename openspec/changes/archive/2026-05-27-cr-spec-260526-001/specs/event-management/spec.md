## ADDED Requirements

### Requirement: 管理者建立活動

系統 SHALL 提供已登入管理者建立活動場次的後台表單，欄位包含活動標題、主視覺網址（選填）、地點、活動時間、注意事項（選填）與主題色。提交時系統 MUST 以 `eventSchema` 驗證輸入，驗證通過後寫入一筆 `Event`，並回傳 `ActionResponse`。

#### Scenario: 成功建立活動

- **WHEN** 已登入管理者於 `/events/new` 填妥標題、地點、活動時間與主題色並提交
- **THEN** 系統建立一筆 `Event`（主視覺與注意事項依填寫存入，未填則為空）
- **AND** 重新驗證儀表板並導回儀表板，新場次出現在列表

#### Scenario: 必填欄位缺漏

- **WHEN** 管理者未填標題或地點或活動時間即提交
- **THEN** 系統不寫入任何資料
- **AND** 回傳 `success: false` 並帶對應欄位的繁體中文錯誤訊息，表單就地標示錯誤欄位

#### Scenario: 主視覺網址格式不符

- **WHEN** 管理者填入非有效網址的主視覺欄位並提交
- **THEN** 系統不寫入資料並回傳該欄位錯誤訊息
- **AND** 主視覺欄位留空時 SHALL 視為合法（選填）

#### Scenario: 主題色限定為設定來源

- **WHEN** 提交的主題色不在 `config/theme-colors.ts` 定義的 10 組之內
- **THEN** 系統拒絕寫入並回傳主題色欄位錯誤

### Requirement: 管理者編輯活動

系統 SHALL 提供已登入管理者編輯既有活動的後台表單，預先載入該活動現值。提交時系統 MUST 以 `eventSchema` 驗證並更新對應 `Event`，且 MUST NOT 變更該活動既有的票券批次與票券。

#### Scenario: 成功編輯活動

- **WHEN** 管理者於 `/events/[id]/edit` 修改任一欄位並提交
- **THEN** 系統更新對應 `Event` 的欄位值
- **AND** 重新驗證儀表板，列表反映更新後的內容

#### Scenario: 編輯不存在的活動

- **WHEN** 管理者開啟的活動 id 不存在
- **THEN** 系統回應查無此活動（顯示 not found），不渲染表單

#### Scenario: 編輯不影響票券批次

- **WHEN** 管理者更新活動的標題、時間或主題色
- **THEN** 系統僅更新 `Event` 本身
- **AND** 該活動既有的 `TicketBatch` 與 `Ticket` 維持不變

### Requirement: 後台僅限授權管理者操作

建立與編輯活動的 Server Action MUST 於執行前驗證 session，未通過者拒絕操作，不依賴 UI 層或 proxy 守門。

#### Scenario: 未登入呼叫被拒

- **WHEN** 無有效 session 的請求觸發建立或編輯 Server Action
- **THEN** 系統不執行任何資料寫入並回傳失敗

### Requirement: 儀表板提供建立與編輯入口

系統 SHALL 於後台儀表板提供「新增活動」入口，並為每筆場次提供進入其編輯頁的連結。

#### Scenario: 從儀表板新增

- **WHEN** 管理者於儀表板點擊「新增活動」
- **THEN** 系統導向 `/events/new` 並顯示空白建立表單

#### Scenario: 從儀表板編輯

- **WHEN** 管理者於儀表板點擊某場次的編輯連結
- **THEN** 系統導向該場次的 `/events/[id]/edit` 並預填現值

### Requirement: 主題色即時預覽

建立與編輯表單 SHALL 提供 10 組主題色選擇器，選取時即時以對應的淺底深色樣式預覽票面外觀。

#### Scenario: 切換主題色更新預覽

- **WHEN** 管理者在表單中選取不同主題色
- **THEN** 預覽區即時套用該色的 `bg`/`text`/`accent` 樣式，與票券頁呈現一致
