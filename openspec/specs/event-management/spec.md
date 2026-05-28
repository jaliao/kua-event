# event-management Specification

## Purpose
TBD - created by archiving change cr-spec-260526-001. Update Purpose after archive.
## Requirements
### Requirement: 管理者建立活動

系統 SHALL 提供已登入管理者建立活動場次的後台表單，欄位包含活動代號、活動標題、主視覺網址（選填）、地點、活動時間、注意事項（選填）與主題色。活動代號為必填，僅限英文與數字（不接受符號），輸入後 MUST 正規化為大寫，且 MUST 在所有活動中唯一；欄位下方 SHALL 顯示填寫說明（格式與用途）。提交時系統 MUST 以 `eventSchema` 驗證輸入，驗證通過後寫入一筆 `Event`，並回傳 `ActionResponse`。

#### Scenario: 成功建立活動

- **WHEN** 已登入管理者於 `/events/new` 填妥活動代號、標題、地點、活動時間與主題色並提交
- **THEN** 系統建立一筆 `Event`（活動代號以大寫存入，主視覺與注意事項依填寫存入，未填則為空）
- **AND** 重新驗證儀表板並導回儀表板，新場次出現在列表

#### Scenario: 活動代號自動轉大寫

- **WHEN** 管理者以小寫或混合大小寫輸入活動代號（如 `ny01`）
- **THEN** 系統將其正規化為大寫（`NY01`）後儲存

#### Scenario: 活動代號格式不符

- **WHEN** 管理者輸入含符號或空白的活動代號（如 `NY-01`、`NY 01`）
- **THEN** 系統不寫入資料並回傳活動代號欄位錯誤訊息

#### Scenario: 活動代號重複

- **WHEN** 管理者輸入已被其他活動使用的代號
- **THEN** 系統不寫入資料並回傳活動代號欄位錯誤訊息「活動代號已被使用」

#### Scenario: 必填欄位缺漏

- **WHEN** 管理者未填活動代號或標題或地點或活動時間即提交
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

系統 SHALL 提供已登入管理者編輯既有活動的後台表單，預先載入該活動現值（含活動代號）。活動代號可於編輯時修改，仍受必填、僅限英數、自動大寫與全活動唯一的約束。提交時系統 MUST 以 `eventSchema` 驗證並更新對應 `Event`，且 MUST NOT 變更該活動既有的票券批次與票券；既有票券已配發的編號 MUST NOT 因代號修改而回溯改變。

#### Scenario: 成功編輯活動

- **WHEN** 管理者於 `/events/[id]/edit` 修改任一欄位並提交
- **THEN** 系統更新對應 `Event` 的欄位值
- **AND** 重新驗證儀表板，列表反映更新後的內容

#### Scenario: 編輯時代號重複

- **WHEN** 管理者將代號改為已被其他活動使用的值
- **THEN** 系統不更新資料並回傳活動代號欄位錯誤訊息

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

系統 SHALL 於後台儀表板以卡片列出每個活動場次。每張卡片 MUST 呈現活動代號、活動名稱與活動日期，並 MUST 顯示該活動的票券張數，分為總張數、團體票張數與早鳥票張數三項；卡片 MUST NOT 顯示活動地點。儀表板 SHALL 提供「新增活動」入口；每張卡片 SHALL 提供三個操作入口「編輯 ｜ 團體票 ｜ 早鳥票」，分別導向該活動的 `/events/[id]/edit`、`/events/[id]/batches` 與 `/events/[id]/early-bird`。

#### Scenario: 從儀表板新增

- **WHEN** 管理者於儀表板點擊「新增活動」
- **THEN** 系統導向 `/events/new` 並顯示空白建立表單

#### Scenario: 卡片呈現活動資訊與票券張數

- **WHEN** 管理者開啟儀表板
- **THEN** 每張活動卡片顯示活動代號、活動名稱、活動日期
- **AND** 顯示該活動票券張數，含總張數、團體票張數與早鳥票張數三項
- **AND** 卡片不顯示活動地點

#### Scenario: 尚未產生票券的活動

- **WHEN** 某活動尚未產生任何票券
- **THEN** 卡片的總張數、團體票張數與早鳥票張數皆顯示為 0

#### Scenario: 從卡片進入編輯

- **WHEN** 管理者於某卡片點擊「編輯」
- **THEN** 系統導向該活動的 `/events/[id]/edit` 並預填現值

#### Scenario: 從卡片進入團體票管理

- **WHEN** 管理者於某卡片點擊「團體票」
- **THEN** 系統導向該活動的 `/events/[id]/batches` 團體票管理頁

#### Scenario: 從卡片進入早鳥票

- **WHEN** 管理者於某卡片點擊「早鳥票」
- **THEN** 系統導向該活動的 `/events/[id]/early-bird` 頁

### Requirement: 主題色即時預覽

建立與編輯表單 SHALL 提供 10 組主題色選擇器，選取時即時以對應的淺底深色樣式預覽票面外觀。

#### Scenario: 切換主題色更新預覽

- **WHEN** 管理者在表單中選取不同主題色
- **THEN** 預覽區即時套用該色的 `bg`/`text`/`accent` 樣式，與票券頁呈現一致

### Requirement: 團體票管理為獨立頁面

系統 SHALL 將團體票批次管理（建立批次、批次清單、Excel 匯出）置於獨立頁面 `/events/[id]/batches`。活動編輯頁 `/events/[id]/edit` MUST 僅供編輯活動基本資料，MUST NOT 包含團體票批次的建立、清單或匯出操作。團體票批次仍依既有規範為新增不修改（additive）。

#### Scenario: 團體票管理頁顯示批次

- **WHEN** 管理者開啟某活動的 `/events/[id]/batches`
- **THEN** 系統顯示該活動的團體票批次清單與建立批次表單，並提供每筆批次的匯出入口

#### Scenario: 編輯頁不含團體票操作

- **WHEN** 管理者開啟某活動的 `/events/[id]/edit`
- **THEN** 頁面僅呈現活動基本資料編輯表單
- **AND** 不出現團體票批次的建立、清單或匯出操作

#### Scenario: 開啟不存在活動的團體票頁

- **WHEN** 管理者開啟的活動 id 不存在
- **THEN** 系統回應查無此活動（顯示 not found）

### Requirement: 早鳥票入口為佔位頁

系統 SHALL 為每個活動提供早鳥票頁 `/events/[id]/early-bird`。在早鳥票名單上傳與 Email 寄發功能實作之前，該頁 MUST 明確標示早鳥票功能尚未開放（開發中），且 MUST NOT 提供任何名單上傳或寄發操作。

#### Scenario: 早鳥票頁標示未開放

- **WHEN** 管理者開啟某活動的 `/events/[id]/early-bird`
- **THEN** 頁面顯示早鳥票功能尚未開放（開發中）的說明與返回入口
- **AND** 不提供任何名單上傳或寄發操作

#### Scenario: 開啟不存在活動的早鳥票頁

- **WHEN** 管理者開啟的活動 id 不存在
- **THEN** 系統回應查無此活動（顯示 not found）

