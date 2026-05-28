# ticket-serial Specification

## Purpose
TBD - created by archiving change cr-spec-260526-002. Update Purpose after archive.
## Requirements
### Requirement: 票券編號規則

票券編號 MUST 由活動代號（`Event.code`）緊接四位數流水號組成，格式為 `{CODE}{seq:4}`（如 `NY010001`），不含內部識別碼或票種字母。流水號 MUST 以每活動單一計數器產生，自 `0001` 起算，跨票種（早鳥票與團體票）共用；不同活動的流水號彼此獨立。流水號 MUST 在資料庫交易內原子遞增，確保併發下不重號。

#### Scenario: 編號格式為代號加四位流水號

- **WHEN** 系統為代號 `NY01` 的活動產生第一張票券
- **THEN** 票券編號為 `NY010001`
- **AND** 同活動下一張為 `NY010002`

#### Scenario: 同活動跨票種共用流水號

- **WHEN** 同一活動先產生一張早鳥票、再產生一張團體票
- **THEN** 兩張票券的編號流水號連續且不重複（如 `NY010001`、`NY010002`）
- **AND** 編號不含區分票種的字母

#### Scenario: 不同活動流水號獨立

- **WHEN** 代號 `NY01` 與 `NY02` 的活動各自產生第一張票券
- **THEN** 兩張票券編號分別為 `NY010001` 與 `NY020001`
- **AND** 各活動的流水號皆自 `0001` 起算

#### Scenario: 併發產生不重號

- **WHEN** 同一活動在交易中連續配發多張票券編號
- **THEN** 每張取得唯一且遞增的流水號，計數器以 upsert 原子遞增
- **AND** 交易回滾時計數器不前進

### Requirement: 票券存取以 accessToken 而非編號

票券公開存取網址 MUST 以 `Ticket.accessToken` 產生，MUST NOT 使用票券編號（`serialNo`）作為存取識別，避免以可推測編號暴露票券。

#### Scenario: 公開網址使用 token

- **WHEN** 系統產生或匯出某票券的存取網址
- **THEN** 網址路徑為 `/t/{accessToken}`
- **AND** 不以 `serialNo` 作為網址識別

