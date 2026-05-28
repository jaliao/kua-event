## MODIFIED Requirements

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

## ADDED Requirements

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
