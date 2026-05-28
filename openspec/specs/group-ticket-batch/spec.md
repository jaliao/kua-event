# group-ticket-batch Specification

## Purpose
TBD - created by archiving change cr-spec-260527-001. Update Purpose after archive.
## Requirements
### Requirement: 建立團體票批次

系統 SHALL 提供已登入管理者為指定活動建立團體票批次，輸入團體名稱與數量。系統 MUST 在單一資料庫交易內建立一筆 `TicketBatch`（`type = GROUP`）並產生與數量相同張數的 `Ticket`，每張票券的 `serialNo` 經 per-event+type 計數器原子遞增、`accessToken` 自動產生、`groupName` 與批次一致。

#### Scenario: 成功建立批次與票券

- **WHEN** 管理者輸入團體名稱與數量 N（在允許上限內）並提交
- **THEN** 系統於單一交易建立一筆 `TicketBatch` 與 N 張 `Ticket`
- **AND** N 張票券的 `serialNo` 連續且不與既有票券重複，`accessToken` 各自唯一
- **AND** 重新驗證該活動頁，新批次出現在批次清單

#### Scenario: 團體名稱缺漏

- **WHEN** 管理者未填團體名稱即提交
- **THEN** 系統不建立任何批次或票券並回傳該欄位錯誤訊息

#### Scenario: 數量非正整數或超過上限

- **WHEN** 管理者填入 0、負數、非整數或超過允許上限的數量
- **THEN** 系統拒絕建立並回傳數量欄位錯誤訊息

#### Scenario: 交易失敗不留半套資料

- **WHEN** 批次或任一票券寫入過程發生錯誤
- **THEN** 整筆交易回滾，不留下批次或部分票券，計數器不前進

### Requirement: 批次為新增不修改

系統 MUST NOT 提供修改或刪除既有團體票批次的操作。追加票數時 SHALL 透過建立另一筆新批次達成。

#### Scenario: 追加票數另建批次

- **WHEN** 管理者需要為同一團體增加票數
- **THEN** 系統以建立新批次的方式處理
- **AND** 既有批次與其票券維持不變

#### Scenario: 無修改既有批次入口

- **WHEN** 管理者檢視既有批次
- **THEN** 介面不提供編輯或刪除該批次的操作

### Requirement: 活動批次清單

系統 SHALL 在活動管理脈絡下顯示該活動的團體票批次清單，包含團體名稱、票券數量與建立時間，並提供建立新批次的入口與匯出入口。

#### Scenario: 顯示批次清單

- **WHEN** 管理者開啟某活動的批次區塊
- **THEN** 系統列出該活動所有團體票批次（團體名稱、數量、建立時間）
- **AND** 每筆批次提供匯出 Excel 的入口

#### Scenario: 尚無批次

- **WHEN** 活動尚未建立任何團體票批次
- **THEN** 系統顯示空狀態提示並提供建立入口

### Requirement: 批次匯出 Excel

系統 SHALL 允許管理者將指定批次匯出為 `.xlsx` 檔，工作表含四欄：序號、票券網址、領票人姓名、領票人 Email。序號與票券網址依該批次每張票券填入；領票人姓名與 Email 留空供窗口填寫。票券網址 MUST 以設定的 base URL 組合 `/t/{accessToken}`。

#### Scenario: 匯出批次

- **WHEN** 管理者對某批次點選匯出
- **THEN** 系統回傳 `.xlsx` 檔下載
- **AND** 每張票券一列，序號欄為該票 `serialNo`、票券網址欄為 base URL 組合 `/t/{accessToken}`
- **AND** 領票人姓名與 Email 兩欄為空白

#### Scenario: 匯出需授權

- **WHEN** 無有效 session 的請求觸發匯出
- **THEN** 系統拒絕並不回傳任何票券資料

#### Scenario: 匯出不存在的批次

- **WHEN** 匯出的批次 id 不存在
- **THEN** 系統回應查無此批次，不回傳檔案

