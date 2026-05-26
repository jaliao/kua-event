# BC-ERP - 專案大綱

> 版本：v0.1.82

---

## 專案核心目標 (Core Objective)

BC-ERP 是一套為小型軟體公司設計的企業資源規劃系統，整合**專案管理、工時追蹤、變更管理與財務流程**，讓團隊能在單一平台上管理從報價到結案的完整專案生命週期。

---

## 技術棧 (Tech Stack)

| 類別 | 技術 | 版本 |
|------|------|------|
| **框架** | Next.js (App Router) | 16.1.1 |
| **前端** | React + TypeScript | 19.2.3 / 5.x |
| **樣式** | Tailwind CSS + Radix UI (shadcn/ui) | 4.x |
| **資料庫** | PostgreSQL + Prisma ORM (多檔案 Schema) | 7.2.0 |
| **認證** | NextAuth 5 (Beta) + Google OAuth + Email 白名單 | 5.0.0-beta.30 |
| **表單驗證** | Zod + React Hook Form | Zod 4.3 / RHF 7.71 |
| **資料表格** | TanStack React Table | 8.21 |
| **拖放排序** | dnd-kit | 6.3 |
| **編輯器** | Milkdown (Markdown WYSIWYG) | 7.18 |
| **圖表** | Recharts | 2.15 |
| **PDF 匯出** | @react-pdf/renderer | 4.x |
| **圖示** | Tabler Icons + Lucide React | — |
| **物件儲存** | Cloudflare R2 (@aws-sdk/client-s3) | — |
| **AI 標籤引擎** | Google Gemini 1.5 Flash (@google/generative-ai) | — |
| **部署** | Docker (多階段建置) + standalone 輸出 | — |

---

## 系統架構 (System Architecture)

### 整體架構

採用 **Next.js App Router 全端架構**，前後端統一於同一專案中，透過 **Server Components + Server Actions** 模式進行資料互動，無獨立 REST API 層。

```
瀏覽器
  │
  ├─ Server Components ── 直接存取資料庫（透過 Prisma）
  │
  └─ Client Components ── 呼叫 Server Actions ── Prisma ── PostgreSQL
```

### 前後端互動方式

- **資料讀取**：Server Components 直接透過 Data Access Layer (`lib/data/`) 查詢 Prisma
- **資料寫入**：Client Components 呼叫 Server Actions (`app/actions/`)，回傳統一的 `ActionResponse` 格式
- **快取刷新**：Server Actions 完成後呼叫 `revalidatePath()` 觸發頁面重新渲染
- **即時計時器**：前端 `useTimer` Hook 搭配 localStorage + cross-tab sync，無需 WebSocket

### 認證架構（多層防護）

```
Request → Middleware（路徑檢查）
        → NextAuth JWT Session（身份驗證）
        → Email 白名單（WhitelistedEmail 資料表）
        → Layout 層 Session 驗證（二次確認）
```

### 路由結構

```
app/
├── (user)/              # 認證路由群組（側邊欄 Layout）
│   ├── dashboard/       # 儀表板
│   ├── projects/        # 專案管理（含 [id] 詳情頁、結案頁）
│   ├── timesheet/       # 工時管理
│   ├── changes/         # 變更管理（進行中列表：僅 draft）
│   │   └── search/      # 查詢變更（搜尋優先）
│   ├── clients/         # 客戶管理（含 [id] 總歸戶頁 + 工時包區塊）
│   ├── daily-scripture/ # 每日讀經管理（CRUD 列表，入口位於使用者選單）
│   ├── km/              # 知識內容頁（唯讀，Markdown 渲染，複製圖示）
│   │   └── [id]/        # /km/[id] — 顯示文章完整內容
│   ├── knowledge/       # 知識管理（維護用）
│   │   ├── articles/    # 知識文章（列表 + 搜尋 + new/ 新增 + [id]/edit/ 編輯；預設最新 24 筆，搜尋全量）
│   │   └── tags/        # 標籤維護（顏色選擇、slug 自動產生）
│   ├── whitelist/       # 白名單管理（CRUD）
│   └── finance/         # 財務會計
│       ├── quotations/      # 報價單（列表 + [code] 詳情 + 版本歷史 + 明細 CRUD + 付款條件 + PDF 匯出）
│       ├── invoices/        # 請款單（列表 + [id] 詳情 + 核銷 + 明細 CRUD）
│       │   └── dashboard/   # 請款儀錶板（待開立發票 + 已開票未收款警示）
│       ├── transactions/    # 收支明細
│       ├── reconciliation/  # 銀行對帳（Excel 匯入 + 自動備註）
│       ├── accounts/        # 常用帳號管理
│       └── rules/           # 備註規則管理
├── actions/             # Server Actions（project, time-entry, change-request, attachment, sticky-note, client, whitelist, bank-transaction, bank-account, bank-note-rule, quotation, invoice, service-package, daily-scripture, knowledge-tag, knowledge-article, knowledge-attachment）
├── api/auth/            # NextAuth API 路由
├── api/attachments/     # 附件 API（列表查詢、presigned URL redirect）
├── api/sticky-notes/    # 便利貼 API（舊版，待整合後刪除）
├── api/knowledge-articles/project/[projectId]/  # 專案便利貼 API（知識文章整合版）
├── api/knowledge-articles/client/[clientId]/    # 客戶便利貼 API（知識文章整合版）
├── api/knowledge-articles/analyze/             # 批次自動標籤 API（POST，Gemini，最多 20 篇）
├── api/knowledge-articles/[id]/analyze/        # 單篇強制重分析 API（POST，Gemini）
├── api/knowledge-articles/generate/            # 表單即時 AI 生成 API（POST，type=tags|summary|title）
├── api/bank-transactions/  # 銀行交易 API（未核銷交易查詢）
├── api/client-systems/     # 客戶系統 API（GET ?clientId=X，回傳 {id,name}[] 供二層下拉使用）
└── api/quotations/[id]/pdf # 報價單 PDF 匯出 API
└── api/invoices/[id]/pdf   # 請款單 PDF 匯出 API
└── api/vendors/options     # 供應商選項 API（供合作夥伴下拉使用）
```

### 側邊欄導航結構

```
儀錶板
知識管理 ▼
  ├── 知識文章
  └── 標籤維護
專案管理
變更管理 ▼
  ├── 進行中變更
  └── 查詢變更
工時紀錄
業務開發 ▼
  ├── 客戶管理
  ├── 報價單
  └── 請款單
財務會計 ▼
  ├── 收支明細
  ├── 銀行對帳
  ├── 常用帳號
  └── 備註規則
團隊成員 ▼
  ├── 團隊成員
  └── 白名單管理
```

---

## 核心資料模型 (Data Schema)

### ER 關聯總覽

```
WhitelistedEmail          （獨立，控制登入權限）

User ─────┬── Account              （NextAuth OAuth 帳號）
          ├── Session              （NextAuth Session）
          ├── TimeEntry[]          （工時紀錄）
          ├── ChangeRequest[]      （變更請求）
          ├── ProjectAttachment[]  （上傳的附件）
          ├── DailyScripture[]     （每日讀經紀錄）
          ├── KnowledgeArticle[]   （建立的知識文章 @relation("ArticleCreatedBy")）
          └── KnowledgeArticle[]   （更新的知識文章 @relation("ArticleUpdatedBy")）

KnowledgeArticle ─┬── KnowledgeArticleTag[]  （標籤關聯中間表，Cascade）
                  ├── KnowledgeAttachment[]   （附件，R2 key, Cascade）
                  ├── Project?                （projectId nullable，便利貼整合，onDelete: SetNull）
                  ├── Client?                 （clientId nullable，客戶便利貼整合，onDelete: SetNull）
                  ├── ClientSystem?           （clientSystemId nullable，便利貼可標記所屬客戶平台，onDelete: SetNull）
                  ├── User                    （createdBy）
                  └── User?                   （updatedBy）

KnowledgeTag ─── KnowledgeArticleTag[]  （文章標籤，Cascade）

Client ───┬── ClientContact[]      （客戶聯絡人）
          ├── ClientSystem[]        （客戶系統，name/techStack/url，Cascade）
          ├── Project[]             （關聯專案）
          ├── BankAccount[]         （關聯帳號）
          ├── Quotation[]           （報價單）
          ├── Invoice[]             （請款單）
          ├── ServicePackage[]      （工時包）
          ├── KnowledgeArticle[]    （客戶便利貼，clientId FK）
          ├── ClientCredit[]        （點數流水帳）
          └── ClientCreditCounter?  （per-client 點數流水號計數器）

Quotation ┬── QuotationItem[]      （報價單明細）
          ├── QuotationPaymentTerm[]（付款條件）    ← 新增
          ├── Client               （所屬客戶）
          ├── Project?             （關聯專案，nullable）
          ├── Quotation?           （parentId 自引用 → 版本歷史）
          └── Invoice[]            （轉出的請款單）

Invoice ──┬── InvoiceItem[]        （請款單明細）
          ├── Client               （所屬客戶）
          ├── Project?             （關聯專案，nullable）
          ├── Quotation?           （來源報價單，nullable）
          ├── BankTransaction[]    （已核銷銀行交易）
          └── ServicePackage[]     （付款觸發產生的工時包）

ServicePackage ── Client + Invoice （來源請款單 + 所屬客戶）

BankAccount ─┬─ BankTransaction[]  （帳號交易紀錄）
             ├── Client?           （關聯客戶，nullable，與 Vendor 互斥）
             └── Vendor?           （關聯供應商 / 合作夥伴，nullable，與 Client 互斥）
BankNoteRule                        （備註自動套用規則，獨立表）

Project ──┬── Client?              （所屬客戶，nullable）
          ├── ClientSystem?         （所屬客戶系統，clientSystemId nullable，onDelete: SetNull）
          ├── Quotation?            （sourceQuotation：來源報價單，nullable，@relation("ProjectSourceQuotation")）
          ├── TimeEntry[]          （工時紀錄）
          ├── ChangeRequest[]      （變更請求）
          ├── ProjectAttachment[]  （專案附件）
          ├── ProjectStickyNote[]  （專案便利貼，待整合後移除）
          ├── KnowledgeArticle[]   （知識文章整合便利貼，projectId FK）
          ├── Quotation[]          （關聯報價單）
          ├── Invoice[]            （請款單）
          ├── ServicePackage?      （工時包，nullable）
          └── ProjectCounter       （流水號計數器，per type+year）
```

### 主要資料表

| 資料表 | 主鍵 | 說明 |
|--------|------|------|
| **User** | UUID | 使用者，含角色（user/admin/superadmin） |
| **Project** | Auto-increment | 專案，含 5 個平行狀態（待啟動/進行中/待驗收/已上線/已結案）、工時統計、財務資訊、billingMode（standard/prepaid）、sourceQuotationId（來源報價單 FK，nullable）、**clientSystemId（客戶系統 FK，nullable，onDelete: SetNull）** |
| **TimeEntry** | Auto-increment | 工時紀錄，記錄起訖時間與計算時數 |
| **ChangeRequest** | Auto-increment | 變更請求，含類型（FEAT/FIX/REFACTOR/SPEC）與優先級 |
| **WhitelistedEmail** | UUID | Email 白名單，控制 Google OAuth 登入權限 |
| **ProjectCounter** | Auto-increment | 專案流水號計數器（per type+year，如 P2601） |
| **ProjectAttachment** | Auto-increment | 專案附件，記錄檔名、大小、類型、R2 key、上傳者 |
| **ProjectStickyNote** | Auto-increment | 專案便利貼，含標題、內容、visibility、重要度（1-5星）、排序、釘選、封存 |
| **Client** | Auto-increment | 客戶公司，含名稱（必填）、統一編號（選填）、**creditBalance**（Decimal(10,1)，即時點數餘額） |
| **ClientContact** | Auto-increment | 客戶聯絡人，含姓名、電話、Email、Line、預設聯絡人標記 |
| **ClientSystem** | Auto-increment | 客戶系統，含系統名稱（必填）、技術線（選填）、系統網址（選填）、updatedAt（資料更新時間）；Client 一對多，onDelete Cascade |
| **Quotation** | Auto-increment | 報價單，含編號（Q{YY}{SEQ:3碼}）、版本（parentId 自引用）、狀態（**draft/quoting/accepted/in_progress/completed/voided/rejected**；僅草稿可編輯）、quotationDate、terms、contactName/Email/Phone、taxRate（Decimal @default(0.05)，0=未稅）、**rejectionReason?/rejectionNote?**（拒絕原因代碼 + 補充說明，僅 rejected 狀態使用） |
| **QuotationItem** | Auto-increment | 報價單明細，含說明、數量（Decimal 一位小數）、單價、小計、預估工時、排序 |
| **QuotationPaymentTerm** | Auto-increment | 報價單付款條件，含描述、百分比（Decimal 5,2）、金額（Decimal 12,2）、排序、**creditPoints（Decimal 10,1，nullable，付款條件分配點數，支援 0.5 步進）** |
| **QuotationCounter** | Auto-increment | 報價單流水號計數器（per type+year） |
| **Invoice** | Auto-increment | 請款單，含編號（手動：INV{YY}{SEQ}，付款條件轉入：INV{quotationCode}-{termIndex}）、狀態（draft/sent/paid/overdue/void）、totalAmount、prepaidHours、paidAt、paymentTermId、parentInvoiceId、revision |
| **InvoiceItem** | Auto-increment | 請款單明細，含說明、數量、單價、小計、工時、排序 |
| **InvoiceCounter** | Auto-increment | 請款單流水號計數器（per type+year） |
| **ServicePackage** | Auto-increment | 工時包，含 totalHours/usedHours/remainingHours、isActive、來源 Invoice |
| **ClientCredit** | Auto-increment | 客戶點數流水帳，含流水號（CC{clientId}-{seq}）、date、type（CREDIT/DEBIT）、amount（Decimal 10,1）、sourceType（SYSTEM_INVOICE/SYSTEM_PROJECT/MANUAL）、sourceInvoiceId（唯一，防重複加點）、sourceProjectId |
| **ClientCreditCounter** | clientId（PK） | per-client 點數流水號計數器 |
| **BankAccount** | Auto-increment | 常用帳號，含帳號（唯一）、名稱、關聯客戶（clientId, nullable）、關聯供應商（vendorId, nullable，與 clientId 互斥）；支援展開查看最近五筆交易 |
| **BankTransaction** | Auto-increment | 銀行交易紀錄，含帳務日期、提出/存入金額、餘額、invoiceId（核銷關聯） |
| **BankNoteRule** | Auto-increment | 備註自動套用規則，含 matchType、matchValue、category、priority |
| **DailyScripture** | Auto-increment | 每日讀經紀錄，含 userId（FK User）、date（@db.Date 不含時間）、ref（經文標題）、lines（多行經文，換行符分隔） |
| **KnowledgeTag** | Auto-increment | 知識標籤，含 name（unique）、slug（unique，自動產生）、color（預設 #6b7280）、description? |
| **KnowledgeArticle** | Auto-increment | 知識文章，含 title、summary（Text）、content（Text，便利貼內容存此欄）、isConfidential、isIndexed（AI 預留）、aiEmbeddingId?（AI 預留）、**analysisStatus**（none/pending/done/failed，Gemini 分析狀態）、**projectId?（FK Project, nullable, 便利貼整合）**、**clientId?（FK Client, nullable, 客戶便利貼整合）**、**clientSystemId?（FK ClientSystem, nullable, 客戶平台標記）**、**isPinned**、**isArchived**、**sortOrder**、**importance（0-5 星）**、createdById/updatedById FK User |
| **KnowledgeArticleTag** | 複合主鍵（articleId+tagId） | 文章標籤中間表，雙向 Cascade 刪除 |
| **KnowledgeAttachment** | Auto-increment | 知識文章附件，含 fileName、fileSize、mimeType、r2Key（知識附件使用 `knowledge/{articleId}/{uuid}-{filename}` 格式） |

### Prisma 多檔案 Schema

```
prisma/schema/
├── base.prisma      # Generator + Datasource 設定
├── user.prisma      # 認證模型（User, Account, Session, WhitelistedEmail）
└── project.prisma   # 業務模型（Project, TimeEntry, ChangeRequest, Client, Quotation, QuotationPaymentTerm, Invoice, ServicePackage, BankAccount, BankTransaction, DailyScripture, KnowledgeTag, KnowledgeArticle, KnowledgeArticleTag, KnowledgeAttachment, ClientCredit, ClientCreditCounter, Counters）
```

自訂輸出路徑：`prisma/generated/prisma_client`（透過 tsconfig paths 映射為 `@prisma/client`）

---

## 關鍵業務邏輯 (Business Logic)

### 1. 專案狀態（5 個平行狀態）

專案狀態採用 Config-Driven 模式（`config/project-status.ts`），定義 5 個平行狀態（無 phase/step 概念）：

| 狀態 | enum 值 | 說明 |
|------|---------|------|
| 待啟動 | `pending_start` | 等待專案正式啟動 |
| 進行中 | `in_progress` | 專案開發進行中 |
| 待驗收 | `pending_acceptance` | 等待客戶驗收確認 |
| 已上線 | `launched` | 系統已正式上線運作 |
| 已結案 | `closed` | 專案已正式結案歸檔 |

專案卡片操作選單提供「切換狀態」子選單，可一鍵切換至任意狀態，呼叫 `updateProjectStatusAction`。
專案管理頁 Tabs 依單一 status 值分頁（待啟動 / 進行中 / 待驗收 / 已上線 / 已結案 / 所有），預設顯示「進行中」。

### 2. 專案編號自動產生

- 格式：`{type}{year}{counter}`（如 `P2601`, `M2601`, `H2601`）
- 三種專案類型：P（軟體開發）、M（軟體維護）、H（系統維護）
- 透過 `ProjectCounter` 搭配 Prisma `$transaction` + `upsert` 確保原子性

### 3. 工時追蹤（Transaction 原子操作）

- 記錄起訖時間，自動計算時數
- 新增/編輯/刪除工時時，同步更新 `Project.hoursUsed`
- 前端計時器（`useTimer` Hook）支援 localStorage 持久化與跨分頁同步

### 4. 變更管理

- 變更編號格式：`CR-{TYPE}-{YYMMDD}-{SEQ}`
- 狀態流轉：`draft` → `published` 或 `archived` → 僅封存可刪除

### 5. 報價單管理

- 報價編號格式：`Q{YY}{SEQ:3碼}`（如 Q26001），透過 QuotationCounter 原子遞增
- **7 個業務狀態**：`draft`（草稿）/ `quoting`（報價中）/ `accepted`（客戶接受）/ `in_progress`（執行中）/ `completed`（已完成）/ `voided`（已作廢）/ `rejected`（客戶拒絕）；**僅 `draft` 可編輯報價資料**（後端 Action + 前端 UI 雙重鎖定）；狀態切換無限制，可任意切換
- **詳情頁操作按鈕（固定業務順序）**：`寄送報價單`（draft→quoting）/ `客戶回簽報價單`（→accepted，rejected 時隱藏）/ `客戶拒絕`（quoting 狀態快捷按鈕，開啟 RejectQuotationDialog）/ `報價單結案`（→completed，AlertDialog 確認，rejected 時隱藏）/ `報價單作廢`（→voided，AlertDialog 確認）/ `轉為專案`（rejected/voided 不顯示）/ `重開報價單` / `匯出 PDF` / `切換狀態▼`（DropdownMenu，攔截 rejected 開啟 Dialog）
- **拒絕流程**：`quoting` 狀態操作區顯示「客戶拒絕」快捷按鈕；切換狀態下拉攔截 `rejected` 選項；開啟 `RejectQuotationDialog`（8 個 Config-Driven 拒絕原因下拉 + 補充說明文字框，選「其他」時補充說明為必填）；`rejectionReason`/`rejectionNote` 持久化至 DB；`rejected` 狀態詳情頁頂部顯示紅色拒絕原因 Banner；`config/quotation-rejection-reason.ts` 定義原因清單
- **請款狀態（計算型）**：`unpaid`（未付款）/ `partial`（部分付款）/ `paid`（已結清），從 `paymentTerms[].invoices[].status` 計算（排除 void）；唯讀 Badge，不存入 DB
- **雙 Badge**：詳情頁編號旁顯示報價狀態 Badge + 請款狀態 Badge；列表頁卡片同樣顯示雙 Badge
- **列表改版**：報價單列表改為 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` 卡片格線
- **版本管理**：重開報價單建立新版本，parentId 指向前一版；`reopenQuotationAction` 在 $transaction 中作廢舊單（→`voided`）並建立新單（→`quoting`，quotationDate=今日）
- **付款條件點數分配**：`QuotationPaymentTerm.creditPoints`（Decimal 10,1，nullable，支援 0.5 步進）；草稿且 `totalHours > 0` 時，付款條件卡片顯示「分配點數」輸入欄（step=0.5）；底部加總 vs totalHours 驗證（不符顯示橘色警告）；`updateQuotationAction` 驗證加總一致（null 視為 0）
- **轉為專案**：非 `voided` 狀態皆顯示「轉為專案」按鈕，開啟 `ConvertToProjectsDialog`，可一次批次建立多個專案，`convertQuotationToProjectsAction` 使用 `$transaction` 確保 ProjectCounter 原子遞增，並寫入 `Project.sourceQuotationId`；Dialog 頂部顯示此報價單已建立的關聯專案清單（唯讀，含代碼、名稱、連結）；專案卡片顯示來源報價單代號（可點擊）
- **轉請款**：`accepted`/`in_progress`/`completed` 狀態可轉請款，付款條件卡片顯示「轉請款」按鈕，自動複製明細至 InvoiceItem
- **付款條件**：QuotationPaymentTerm 多期付款條件（描述、百分比、金額），delete-all + create-all 策略更新
- **附註條款**：terms 純文字欄位，Textarea 編輯
- **服務窗口**：contactName/Email/Phone 快照式記錄，支援從 ClientContact 帶入
- **含稅計算**：`taxRate` 欄位（Decimal，預設 0.05 = 5%），草稿模式可透過 Switch 切換含稅/未稅，`taxAmount = Math.round(totalAmount * taxRate)`，`totalWithTax = totalAmount + taxAmount`；付款條件雙向計算基準改為 `base = Math.round(totalAmount * (1 + taxRate))`
- **報價單 PDF 匯出**：`/api/quotations/[id]/pdf` API Route，@react-pdf/renderer 產生雙頁 PDF（明細頁 + 條款簽名頁），Noto Sans TC 中文字型，支援預覽（`?preview=1`）與下載，公司印章自動嵌入；taxRate > 0 時 PDF 顯示「未稅小計 / 稅額 / 含稅合計」三列
- **請款單 PDF 匯出**：`/api/invoices/[id]/pdf` API Route，單頁 PDF（公司抬頭 + 明細表格 + 合計 + 備註），下載時自動命名；報價單付款條件列已轉請款者旁有 Download 按鈕可直接下載

### 6. 請款單管理

- 請款編號格式：手動建立 `INV{YY}{SEQ}`（InvoiceCounter），付款條件轉入 `INV{quotationCode}-{termIndex}`，作廢重開 `INV{quotationCode}-{termIndex}-{revision:02d}`
- 狀態流轉：`draft` → `sent` → `paid` / `overdue`，`void` 可從任何狀態觸發
- **付款觸發邏輯**：標記 paid 且 prepaidHours > 0 時，自動在同一 transaction 中建立 ServicePackage
- **發票加點觸發**：狀態切換為 `invoiced` 時，若 clientId 存在且 prepaidHours > 0，同一 transaction 自動建立 ClientCredit（CREDIT, SYSTEM_INVOICE），更新 Client.creditBalance；sourceInvoiceId 唯一索引防重複
- **對帳核銷**：選擇未核銷的 BankTransaction 關聯至 Invoice，存入金額總和 ≥ totalAmount 時自動觸發付款
- 取消核銷：已付款的 Invoice 不可取消核銷

### 7. 工時包（ServicePackage）

- 付款觸發自動建立，記錄 totalHours / usedHours / remainingHours
- 手動更新 usedHours（不可超過 totalHours），自動重算 remainingHours
- 停用操作（isActive = false）
- 客戶總歸戶頁顯示所有工時包、Progress bar、剩餘工時總計

### 8. 計費模式（billingMode）

- 專案新增 `billingMode` 欄位，預設 `standard`（標準計費）
- `prepaid`（扣抵工時）模式須指定客戶，卡片顯示「扣抵工時」Badge
- 專案建立/更新時驗證 prepaid 模式必須有 clientId

### 9. 銀行交易匯入與自動備註

- **Excel 匯入**：接受銀行匯出的 HTML-table 格式 .xls 檔案，使用 cheerio 解析
- **重複偵測**：7 欄位複合唯一索引 + `createMany({ skipDuplicates: true })`
- **自動備註引擎**（`lib/auto-note-engine.ts`）：規則比對 → 歷史學習 → 無匹配留空
- **備註分類**：Config-Driven 下拉選單（11 分類）

### 10. 知識文章自動標籤（Gemini AI）

- 文章儲存（新增/更新）後，`onAfterSave` Hook 自動將 `analysisStatus` 設為 `"pending"`
- 批次分析 API（`POST /api/knowledge-articles/analyze`）取 pending 文章（最多 20 篇）→ 呼叫 Gemini 1.5 Flash → 寫入標籤 → 設為 `done/failed`
- 單篇強制重分析 API（`POST /api/knowledge-articles/[id]/analyze`）
- **自動標籤引擎**（`lib/auto-tag-engine.ts`）：JSON Schema 強制輸出、最多 8 個標籤、繁體中文統一、現有標籤庫比對（完全名稱匹配直接關聯，不存在則 upsert 建立 auto-slug + #6b7280）
- **分析狀態顯示**：文章列表 Badge（`none`=不顯示、`pending`=灰色「待分析」、`done`=綠色「已分析」、`failed`=紅色「失敗」）+ 頂部「執行批次分析」按鈕（pending 數量 Badge）

### 11. 權限校驗

- Middleware 層攔截未認證請求
- Google OAuth + WhitelistedEmail 白名單制
- JWT Callback 同步資料庫使用者資訊

---

## 開發規範 (Coding Standards)

### 命名與語言

- 程式碼註解與文件一律使用**繁體中文**
- 檔案標頭格式：含元件名稱、日期、檔案路徑

### 架構模式

- **Server Components 優先**：預設為 Server Component，僅在需要互動時標記 `"use client"`
- **Server Actions**：統一回傳 `ActionResponse { success, message, data, errors }` 格式
- **Config-Driven Enums**：狀態、類型等列舉值集中於 `config/` 目錄
- **Zod Schema**：定義於 `lib/schemas/`，前後端共用驗證邏輯
- **Data Access Layer**：`lib/data/` 封裝跨元件共用的查詢邏輯

### 版本管理

- 版本號遵循 SemVer（`major.minor.patch`）
- 唯一來源：`config/version.json`
- 每次套用變更自動遞增 patch 版本號

---

## 當前挑戰與任務 (Current Status & Backlog)

### 目前版本：v0.1.82

### 已完成的近期功能

- 儀表板財務監控啟用（CR-SPEC-260409-008）：「待開立發票」與「已開票未收款」卡片由佔位符改為實際資料；顯示筆數、總金額（隱藏切換）、最多 3 筆客戶名稱清單；點擊連結至 /finance/invoices；金額顯示與「年度業績」共用同一 visible 開關
- 報價單卡片優化（CR-SPEC-260409-007）：`rejected` 狀態改灰色；新增 `QuotationStatusBadge` / `QuotationPaymentStatusBadge` 統一元件（`components/finance/quotation-status-badge.tsx`）套用至列表與詳情頁；`completed + unpaid` 卡片顯示紅色警示「請盡快完成請款作業」；`getCompletedUnpaidQuotationCount()` 查詢加入儀表板第四項提醒
- 銀行對帳對象欄優化（CR-SPEC-260409-006）：`getBankTransactions()` 新增 vendor include；`reconciliation/page.tsx` 序列化改為 `subjectName`（client?.name ?? vendor?.name）+ `isVendor`；欄位標題改「對象」；有名稱時客戶藍色/供應商紫色，桌機下方顯示小字帳號，手機僅名稱；`RemindersBlock` 新增第三項提醒（常用帳號未設定對象）；`getUnconfiguredBankAccountCount()` 加入儀表板查詢
- 儀表板重要事項提醒（CR-SPEC-260409-005）：工時生產力上方新增提醒單元；偵測上個月銀行交易是否完全缺失（`getLastMonthBankTransactionCount`）、舊月份請款單發票是否未上傳（`getUnfiledInvoiceCount`）；無提醒時整個區塊不渲染；`RemindersBlock` Server Component，amber 警示卡風格
- 銀行對帳備註顯示優化（CR-SPEC-260409-003）：「使用者備註」已填寫列改為文字模式（分類 Label + Pencil 編輯按鈕），點擊切換下拉選單；未填寫列維持原有 Select 下拉；`editingId state` 確保同一時間僅一列處於編輯模式；選取新值後自動儲存並回到文字模式
- 報價單拒絕流程（CR-SPEC-260409-002）：新增 `rejected`（客戶拒絕）第 7 個業務狀態；Quotation schema 新增 `rejectionReason String?`/`rejectionNote String?`；`config/quotation-rejection-reason.ts` 8 個 Config-Driven 拒絕原因（price_over_budget/timeline_mismatch/scope_mismatch/chose_other_vendor/project_on_hold/internal_decision/no_response/other）；`updateQuotationStatusAction` 擴充 rejectionReason/rejectionNote 參數（Zod superRefine 確保 rejected 必填原因）；`RejectQuotationDialog` 元件（下拉選單 + 補充說明文字框，選「其他」轉必填）；quoting 狀態快捷「客戶拒絕」按鈕；切換狀態下拉攔截 rejected；rejected 狀態頂部紅色 Banner 顯示原因；rejected 隱藏「轉為專案」按鈕
- 結案導向 404 修正（cr-fix-260409-001）：`close-project-button.tsx` 結案後 `router.push("/main")` → `router.push("/projects")`
- 報價單狀態功能控制（CR-SPEC-260311-003）：僅 `draft` 狀態可編輯（前後端雙重鎖定）；詳情頁操作按鈕重組為四個業務快捷（寄送/客戶回簽/結案/作廢，各含 AlertDialog 確認）；「切換狀態」DropdownMenu 移至操作區末尾（匯出 PDF 後）；`QuotationPaymentTerm` 新增 `creditPoints Decimal?(10,1)` 付款條件點數分配欄位（0.5 步進）；草稿且 totalHours > 0 時顯示點數輸入欄，底部加總驗證（不符橘色警告）；`updateQuotationAction` 驗證 creditPoints 加總一致；Zod `paymentTermSchema` 新增 `multipleOf(0.5)` 驗證
- 報價單狀態改版（CR-SPEC-260311-002）：`QuotationStatus` 從 6 個流程狀態精簡為 5 個業務狀態（quoting/accepted/in_progress/completed/voided）；移除 `VALID_QUOTATION_TRANSITIONS` 轉換限制；新增計算型請款狀態（unpaid/partial/paid，純函式）；報價單列表改為卡片格線（`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`）；詳情頁編號旁新增雙 Badge + 「切換狀態」DropdownMenu（CheckIcon 標示當前）；移除舊「寄出/標記接受/標記拒絕」按鈕；資料遷移：draft/sent→quoting、rejected/expired/void→voided；`getQuotations()` 新增 `paymentTerms.invoices` include；新增 `config/quotation-payment-status.ts` + `lib/utils/quotation-payment-status.ts`
- 專案狀態改版（CR-SPEC-260311-001）：`ProjectStatus` enum 從 9 個細分狀態精簡為 5 個平行狀態（pending_start/in_progress/pending_acceptance/launched/closed）；`config/project-status.ts` 移除 phase/step 概念；資料遷移：quoting→pending_start、accepted/billing_confirm/invoiced→launched；專案管理頁 Tabs 從 phase 分組改為單一 status 分頁（5 個狀態 + 所有，預設進行中）；`PROJECT_FILTER_VIEWS` 的 `phase?: number` 改為 `status?: string`；專案卡片 DropdownMenu 新增「切換狀態」`DropdownMenuSub`（CheckIcon 標示當前狀態，呼叫 `updateProjectStatusAction`，成功/失敗 toast）；新增 `updateProjectStatusAction` Server Action
- 客戶點數機制（CR-SPEC-260310-001）：新增 `ClientCredit` 點數流水帳資料模型（Decimal 支援小數點一位）；`Client.creditBalance` 即時餘額欄位（$transaction 原子更新）；`ClientCreditCounter` per-client 流水號計數器（格式 CC{clientId}-{seq}）；請款單切換為 `invoiced` 時自動加點（SYSTEM_INVOICE，唯一索引防重複）；專案結案時可填扣點數量（SYSTEM_PROJECT，含點數不足 amber 警告）；手動加點/扣點 Dialog；客戶詳情頁新增「點數」第四頁籤（餘額大字 + 紀錄清單 + 手動操作按鈕）；`app/actions/client-credit.ts` 含 `createCreditRecord` 內部 helper 共用
- 專案選取器元件（CR-SPEC-260309-006）：新增 `ProjectPickerDialog` 共用元件（`components/ui/project-picker-dialog.tsx`），以 Dialog + Data Table 取代靜態 Select 下拉；搜尋框 debounce 300ms 呼叫 `/api/projects/options?q=` 動態查詢；Data Table 顯示專案代號（monospace）、專案名稱、所屬客戶、專案狀態 Badge；點擊列單選，支援一鍵清除；知識文章列表頁專案篩選改用此元件，移除 SSR `getProjectOptionsAll()` 查詢與靜態 `projectOptions` prop；`GET /api/projects/options` 新增 `?q=` ILIKE 搜尋 + `clientName` + `status` 回傳欄位，未傳 q 時取 30 筆
- 知識文章脈絡篩選（CR-SPEC-260309-004）：`KnowledgeArticle` 表單新增「客戶」Popover Combobox、「專案」Popover Combobox、「重要度」StarRating（0-5 星）三個欄位；`updateKnowledgeArticleAction` 補齊 `clientId`/`projectId` 更新；`getKnowledgeArticles()` / `searchKnowledgeArticles()` 新增 `options: { clientId?, projectId? }` 過濾；新增 `getProjectOptionsAll()` 查詢所有專案（不限狀態）；新增 `GET /api/projects/options` API Route；列表頁頂部新增「客戶」Select 與「專案」Select 篩選下拉，選取後更新 URL `?clientId=` / `?projectId=`（與 `?q=` 並存）；`lib/schemas/knowledge.ts` 補齊 `projectId`/`importance` 欄位
- 知識文章 UX 優化（CR-SPEC-260309-003）：首頁改為預設最新 24 筆（`getKnowledgeArticles` take:24）；完全移除標籤篩選列及 `?tags=` URL param；搜尋有詞時全量顯示（`searchKnowledgeArticles` 移除 take 限制，僅接受 `q`）；文章編輯頁改為滿版佈局（移除 `max-w-4xl`），頂部改為 sticky top bar（含返回/標題/儲存按鈕）；標籤選取由 Badge 全列切換改為 Popover + Command Combobox（可搜尋，已選標籤以彩色可移除 Badge 顯示）
- 報價單專案檢視（CR-SPEC-260304-007）：報價單詳情頁明細項目上方新增「專案」卡片區塊，顯示所有版本家族關聯專案；卡片資訊含專案代碼/名稱（可點擊）、狀態 Badge、工時進度（有 totalHours 顯示 Progress bar，否則純文字）、進行中 CR 數、已完成 CR 數、知識文章數；刪除按鈕恆常可見，無工時且無知識文章可刪除（確認後執行），否則 AlertDialog 說明原因；區塊標題列新增「新增專案」按鈕（複用 ConvertToProjectsDialog）；新增 `deleteProjectFromQuotationAction`；`getQuotationByCode` 擴充 sourceProjects select 含統計欄位
- 重開報價單帶入家族專案（CR-SPEC-260304-006）：`getQuotationByCode()` 的 sourceProjects 改為兩段查詢彙總整個版本家族（同 root parentId）的所有關聯專案；新版本報價單詳情頁與 ConvertToProjectsDialog 正確顯示舊版本已建立的專案，避免重複轉出
- 重開報價單（CR-SPEC-260304-005）：詳情頁「複製並新增」改為「重開報價單」按鈕（非 draft/non-void 狀態顯示）；點擊開啟 AlertDialog 警告視窗（AlertTriangle + 紅圈）；確認後執行 `reopenQuotationAction`，在 $transaction 中作廢舊單（status→void）、建立新草稿（quotationDate=今日、version=0）並導向新報價單；新增 `void` 狀態至 `config/quotation-status.ts`（灰色「已作廢」）
- 請款單發票 AI 分析（CR-SPEC-260304-004）：上傳發票時 Gemini 2.5 Flash 分析 6 欄位（發票號碼、日期、金額、銷售額、稅額、總計）；新 InvoiceFileData 資料模型（1-to-1 Invoice）；`InvoiceFileDataCard` 元件（CardHeader/CardContent/CardFooter、可編輯、重新分析）；fire-and-forget 異步分析；詳情頁整合卡片取代舊純文字列
- 付款條件 UI 卡片化（CR-SPEC-260304-002）：PaymentTermsSection 改為 Card 網格（sm:grid-cols-2 lg:grid-cols-3）；CardHeader/CardAction/CardContent/CardFooter 語意化；請款狀態 Badge 使用 invStatusCfg.color；CardFooter 固定底部
- 變更管理篩選優化（CR-SPEC-260214-003）：進行中變更列表專案篩選改由 Tabs 改為 Select 下拉選單，放置於標題列「新增變更」按鈕左側，選項顯示各專案名稱與進行中變更數量（`{projectCode} {projectName}（{count} 筆）`）
- 結案信件預覽修正（CR-FIX-260302-002）：`invoice-email-preview` 工時明細改讀 `TimeEntry.title`（工作標題），`TimeEntry` 型別補充 `title: string` 欄位
- 知識文章表單 AI 功能（CR-SPEC-260301-004）：文章新增/編輯表單新增「AI 功能」區塊（三個 Switch）；**自動產生標籤** — 呼叫 Gemini 直接覆蓋表單標籤；**自動產生摘要** — 欄位為空時直接填入，有內容時顯示建議供確認（採用/略過）；**自動產生標題** — 同摘要邏輯；Switch 生成中設為 disabled，完成後自動關閉；新增 `POST /api/knowledge-articles/generate`（`type=tags|summary|title`）；`lib/auto-tag-engine.ts` 擴充 `generateSummaryWithGemini` / `generateTitleWithGemini`
- 知識文章卡片語意化重構（CR-SPEC-260302-001）：卡片改用 `Card` / `CardHeader` / `CardContent` / `CardFooter` 語意化結構；脈絡 Badge（客戶/客戶平台/專案）與標籤 Badge 合併為頂部單一 Badge 行（機密→AI分析→客戶→平台→專案→標籤，上限 6 個，超出顯示 `+N`）；標題連結移入 `CardHeader`；操作按鈕（編輯/封存）移入 `CardFooter`；所有 Badge 統一 `variant="outline"`，機密 Badge 含 Lock icon，脈絡 Badge 保留可點擊 Link
- 知識文章搜尋整合（CR-SPEC-260301-003）：側邊欄移除「知識搜尋」入口，「文章維護」重命名為「知識文章」；搜尋框整合至 `/knowledge/articles` 頁面標題列（debounce 300ms、URL `?q=` 同步）；搜尋結果與全部文章共用七行格線卡片；刪除獨立搜尋頁（`/knowledge/search`）及 `knowledge-search-client.tsx`；`useEffect` 修正 initialArticles / initialQuery props 變更後 state 不同步問題；Suspense 邊界確保 Next.js 靜態分析不報錯
- 卡片格線標準化（CR-SPEC-260301-002）：所有卡片列表統一 `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` RWD 格線，涵蓋知識文章列表、專案管理（`data-table.tsx`）、變更管理（`change-list-client.tsx`）
- 知識文章卡片七行重設計（CR-SPEC-260301-001）：卡片改為七行垂直佈局（脈絡 Badge / 星級 / 標題連結 / 更新時間 / 簡介 / 屬性 Badge / 操作按鈕）；操作按鈕改為「編輯＋封存」（移除列表層級刪除）；文字樣式參考變更卡片、按鈕樣式參考便利貼卡片；`articleListInclude` 新增 `client`/`clientSystem`/`project` 關聯查詢
- 知識文章閱讀模式顯示優化（CR-SPEC-260228-003）：`/km/[id]` 閱讀頁移除 `max-w-4xl` 限制，改為全版面配置；標題下方新增脈絡 Badge row（客戶名稱/連結、客戶系統名稱、專案代碼+名稱/連結），有值才渲染；`articleDetailInclude` 新增 `client`/`clientSystem`/`project` 關聯查詢；搜尋結果每筆卡片同樣顯示脈絡 Badge（Building2/Monitor/FolderKanban 圖示）；`searchKnowledgeArticles` 使用獨立 `articleSearchInclude` 常數確保型別推斷正確
- 客戶便利貼優化（CR-SPEC-260228-004）：客戶詳情頁 Tabs 由 2 個擴充為 3 個（基本資料 / 客戶系統 / 便利貼），「系統管理」重命名為「客戶系統」；便利貼移至獨立 Tab；`KnowledgeArticle` 新增 `clientSystemId` nullable FK（onDelete: SetNull）；便利貼編輯模式新增「客戶平台」下拉選單（動態載入 `/api/client-systems?clientId=X`）；便利貼內容存放欄位從 `summary` 改為 `content`；提供 `prisma/seed-migrate-sticky-notes-content.ts` 冪等遷移腳本
- 專案與客戶系統關聯（CR-SPEC-260228-002）：Project 新增 `clientSystemId` FK（onDelete: SetNull）；`/api/client-systems` API Route（GET ?clientId=X 回傳系統清單）；新增/編輯專案 Dialog 新增二層下拉（先選客戶、再選客戶系統），客戶無系統時出現「＋ 新增客戶系統」選項（以專案名稱建立）；專案卡片顯示客戶系統名稱（客戶名稱後以「／」分隔）
- 客戶系統管理（CR-SPEC-260228-001）：ClientSystem 資料模型（name 必填、techStack 選填 Textarea、url 選填）；客戶詳情頁新增 Tabs line variant（「基本資料」＋「系統管理」），tab 狀態以 URL search params `?tab=systems` 持久化；系統 CRUD Dialog（新增/編輯/刪除）
- 知識文章自動標籤引擎（CR-SPEC-260227-002）：KnowledgeArticle 新增 `analysisStatus` 欄位（none/pending/done/failed）；`onAfterSave` 設為 pending；`lib/gemini.ts`（Gemini 1.5 Flash 初始化）；`lib/auto-tag-engine.ts`（JSON Schema 強制輸出、標籤庫比對、auto-slug upsert）；批次 API `POST /api/knowledge-articles/analyze`；單篇 API `POST /api/knowledge-articles/[id]/analyze`；文章列表分析狀態 Badge + 「執行批次分析」按鈕（pending 數量 Badge、loading spinner、toast 結果）
- 客戶便利貼（CR-SPEC-260227-001）：KnowledgeArticle 新增 `clientId` FK（onDelete: SetNull）、`Client` 新增 `knowledgeArticles` 反向關聯；新增 `getClientKnowledgeArticles` / `getArchivedClientKnowledgeArticles` 查詢函數；`createKnowledgeArticleAction` 擴充 `clientId` 支援；`/api/knowledge-articles/client/[clientId]` API Route；`ClientStickyNotesDialog` 元件（dnd-kit 4 欄網格排序，複用 StickyNoteCard）；客戶詳情頁頂部新增「便利貼」按鈕（Badge 顯示數量）
- 便利貼整合知識管理（CR-SPEC-260226-002）：KnowledgeArticle 擴充 `projectId`/`isPinned`/`isArchived`/`sortOrder`/`importance` 欄位；`ProjectStickyNotesDialog` 改接 `createKnowledgeArticleAction`/`updateKnowledgeArticleAction`/`deleteKnowledgeArticleAction`/`toggleKnowledgeArticlePinAction`/`toggleKnowledgeArticleArchiveAction`/`updateKnowledgeArticleOrderAction`；便利貼卡片點擊導向 `/km/[id]`；新增 `/api/knowledge-articles/project/[projectId]` API Route；文章維護列表顯示釘選 Badge + 星級；遷移腳本 `prisma/seed-migrate-sticky-notes.ts`
- 知識內容頁：新增 `/km/[id]` 唯讀閱讀頁（react-markdown 完整渲染、Clipboard API 一鍵複製全文、右上角「編輯」按鈕）、搜尋結果與文章列表標題連結改指向 `/km/[id]`（CR-SPEC-260226-003）
- 知識管理模組：KnowledgeTag / KnowledgeArticle / KnowledgeAttachment 三資料模型、標籤 CRUD（color picker + slug 自動產生）、文章 CRUD（標題、機密/非機密、摘要/內容 Milkdown WYSIWYG、標籤多選 Badge 切換、R2 附件上傳/刪除）、Google-like 知識搜尋（debounce 300ms URL sync、結果 >10 筆顯示標籤篩選）、`searchKnowledgeArticles` AI-ready 介面（ILIKE 初版，預留 Vector Search）、側邊欄儀表板後新增「知識管理」子選單（CR-FEAT-260226-001）
- 每日讀經整合至 Site Header：移除 Dashboard 讀經區塊，改由 layout.tsx Server Component fetch 今日讀經並傳入 SiteHeader props；Drawer 改 direction="top"，支援 scroll snap 橫滑多筆（CR-SPEC-260226-001）
- 每日讀經功能：Dashboard 頂部新增讀經區塊（點擊開啟上方 Drawer，橫向 scroll snap 切換多筆），使用者選單新增「每日讀經」管理入口（/daily-scripture），DailyScripture 資料模型（userId, date, ref, lines）（CR-FEAT-260224-006）
- 進行中變更計費定義修正與今日標籤：計費/非計費 Tab 改以 `isBillable` 為判斷依據（對齊專案管理列表定義）；CR 卡片新增橘色「今日」Badge，顯示當天建立的變更（CR-FIX-260224-002）
- 工時填寫帶入變更單標題：工作標題欄位旁新增 ClipboardCopy 按鈕，選取變更單後可一鍵帶入標題（CR-FEAT-260224-005）
- 進行中變更計費分類 Tab：側邊欄拆為計費中/非計費進行中變更（CR-FEAT-260224-002）
- 常用帳號增強：BankAccount 新增 `vendorId` FK 關聯 Vendor（clientId/vendorId 互斥）、帳號列展開顯示最近五筆交易（日期/提出/存入/銀行備註）、合作夥伴下拉改為 SelectGroup 分「客戶」與「供應商」兩組（CR-SPEC-260221-005）
- 供應商管理模組：Vendor CRUD（個人/企業）、VendorBankAccount 多筆帳號管理（設為預設）、側邊欄「業務開發」新增供應商管理並調整順序（CR-SPEC-260221-004）
- 供應商管理模組：Vendor CRUD（個人/企業兩種類型、taxId/nationalId/phone/email/lineId）、VendorBankAccount 多筆銀行帳號管理（isDefault $transaction 原子操作）、側邊欄「業務開發」重排序並新增「供應商管理」入口（CR-SPEC-260221-004）
- 報價單標記拒絕放寬：任何非 rejected 狀態（draft/sent/accepted/expired）皆可標記拒絕，`VALID_QUOTATION_TRANSITIONS` 新增對應轉換（CR-SPEC-260221-003）
- 報價單轉專案功能擴展：「轉為專案」按鈕開放 draft/sent/accepted 三種狀態、移除 Action 狀態驗證、Dialog 新增已建立關聯專案清單（CR-SPEC-260221-002）
- 報價單項目數量小數支援：`QuotationItem.quantity` 從 `Int` 改為 `Decimal(10,1)`，最小值 0.1，前端 Input step=0.1，序列化層補 `Number()` 轉換（CR-SPEC-260221-001）
- 專案設定報價單：專案卡片 DropdownMenu 新增「設定報價單」選項，開啟 SetQuotationDialog 可搜尋並關聯任意報價單或清除關聯，`setProjectQuotationAction` 更新 sourceQuotationId，`/api/quotations/options` API Route 提供選項（CR-FEAT-260220-001）
- 報價與轉化專案：accepted 報價單新增「轉為專案」按鈕，支援批次建立多個專案，專案記錄來源報價單代號（sourceQuotationId FK），專案卡片顯示可點擊來源報價單代號（CR-FEAT-260219-001）
- 請款單儀錶板：待開立發票（confirmed + 無發票檔）與已開票未收款（有發票檔 + 未到款）兩個警示區塊，側邊欄新增「請款儀錶板」入口（CR-FEAT-260206-010）
- 變更管理查詢效能優化：移除三 Tab（草稿/已發布/封存）、進行中變更列表僅顯示 draft、新增查詢變更頁面（搜尋優先）、側邊欄「變更管理」改子選單（CR-FEAT-260219-001）
- 報價單含稅優化：taxRate 欄位（Decimal @default(0.05)）、Switch 切換含稅/未稅、基本資訊區顯示含稅合計（未稅+稅額）、付款條件計算基準改為含稅合計、PDF 含稅三列、新增報價預設含稅（CR-SPEC-260218-001）
- 報價轉請款優化：付款條件逐筆轉請款（INV{quotationCode}-{termIndex}）、作廢重開修訂版號、側邊欄請款單移至業務開發、「客戶已確認」狀態、confirmed 請款單發票上傳（R2）、confirmed/paid 不可作廢刪除（CR-FEAT-260212-002）
- 變更管理專案排序優化：專案下拉選單計費專案優先排序 + 專案代號 monospace 粗體視覺強調 + 扣抵標籤（CR-SPEC-260214-003）
- 報價單優化 II：URL 改用 quotationCode（/finance/quotations/Q26001）、付款條件預設 50/50 + 百分比↔金額雙向計算、預設附註條款勾選機制、服務窗口自動帶入登入者（CR-SPEC-260217-001）
- 報價單擴充：付款條件 CRUD、附註條款、服務窗口（帶入聯絡人）、報價日期（必填）、有效期限（預設 30 天）、PDF 匯出（雙頁 @react-pdf/renderer + 預覽/下載 + 公司印章）、側邊欄「業務開發」子選單重組（CR-SPEC-260213-001）
- 報價單與請款單模組：報價單 CRUD + 版本管理 + 轉請款、請款單 CRUD + 付款觸發 + 對帳核銷、工時包自動建立 + 手動更新 + 停用、專案 billingMode 計費模式（CR-FEAT-260213-001）
- 白名單管理介面：前端 CRUD 管理 WhitelistedEmail，側邊欄子選單結構（CR-FEAT-260206-009）
- 專案卡片元件標準化：`ProjectCard` 共用元件，分層 props 設計（CR-REFACTOR-260212-001）
- 銀行備註自動分類：Config-Driven 下拉選單（11 分類）、自動備註引擎、來源 Badge（CR-FEAT-260211-003）
- 銀行交易 Excel 匯入：HTML-table .xls 解析、重複偵測、自動建立對方帳號（CR-FEAT-260206-005）
- 客戶管理模組：Client/ClientContact CRUD、客戶總歸戶頁面（CR-FEAT-260211-001）
- 專案便利貼：dnd-kit 拖放排序、inline 編輯（CR-FEAT-260206-013）

### 進行中 / 待處理

- 財務模組收支明細頁面為初始狀態，待開發
- 尚無正式自動化測試（unit / integration / e2e）
- 部署流程依賴手動 SSH Tunnel + Makefile 指令

### 已知限制

- 認證僅支援 Google OAuth（Email 白名單制）
- 無即時通知機制（無 WebSocket / SSE）
- 專案狀態切換無轉換限制（任意狀態可互相切換，由使用者自行負責）
