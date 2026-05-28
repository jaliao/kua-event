# kua-event — 跨團體票系統

> 版本：v0.1.0

跨團體活動的票券發放系統，負責**團體票（團體票）**與**早鳥票（早鳥票）**的產生與分派。

- 正式網域：`https://event.kuaglobal.org/`
- 測試網域：`https://kua-event.blockcode.com.tw`

---

## 專案核心目標 (Core Objective)

為單一活動的**四個獨立場次**（紐約早場 / 紐約晚場 / 洛杉磯早場 / 洛杉磯晚場，各為獨立票券）提供票券發放與呈現：

- 後台管理員建立活動、批次產生票券。
- **團體票**：以團體為單位批次產生，匯出 Excel 由窗口自行分派。
- **早鳥票**：上傳名單後，由系統 Email 寄發票券連結。
- **全程免驗票**：領票人直接於手機開啟票券頁出示即可，無掃碼、無登入、無報到。
- UI 採 **Mobile-First**，以「在手機上直接呈現票券模樣」為核心。

需求單一真實來源：[`docs/requirement.md`](docs/requirement.md)。

---

## 技術棧 (Tech Stack)

| 類別 | 技術 | 版本 |
|------|------|------|
| **框架** | Next.js（App Router, Turbopack） | 16.2.6 |
| **前端** | React + TypeScript | 19.2.4 / 5.x |
| **樣式** | Tailwind CSS | 4.x |
| **資料庫** | PostgreSQL + Prisma ORM（多檔案 Schema + pg driver adapter） | 7.8 |
| **認證** | NextAuth 5（Beta）+ Google OAuth + Email 白名單 | 5.0.0-beta.31 |
| **表單驗證** | Zod + React Hook Form | Zod 4 / RHF 7 |
| **部署** | Docker（多階段建置）+ `standalone` 輸出 | — |

---

## 系統架構 (System Architecture)

### 整體架構

採 **Next.js App Router 全端架構**，透過 **Server Components + Server Actions** 互動，無獨立 REST API 層。

```
瀏覽器
  ├─ 後台管理員（需登入）── (admin) 路由群組 ── Server Components/Actions ── Prisma ── PostgreSQL
  └─ 領票人（免登入）──── /t/[token] 公開票券頁（免驗票）
```

### 認證架構（僅後台管理員）

```
Request → proxy.ts（edge：authorized 判斷，公開路徑放行）
        → NextAuth JWT Session
        → signIn 比對 WhitelistedEmail（Node：Prisma 白名單檢查）
        → (admin)/layout.tsx Server 端二次驗證
```

- **僅後台需登入**；領票人永遠不需認證。
- 因 pg driver adapter 無法在 edge 執行，認證設定拆為 **edge 安全的 `auth.config.ts`**（供 `proxy.ts`）與 **Node 端的 `auth.ts`**（含 Prisma 白名單檢查）。
- Next 16 以 **`proxy.ts`** 取代舊的 `middleware.ts`。

### 路由結構

```
app/
├── (admin)/                    # 後台路由群組（需登入，layout 守衛）
│   ├── layout.tsx              # Session 二次驗證 + 頂部列 / 登出
│   └── page.tsx                # 儀表板（活動場次列表）
├── login/                      # Google OAuth 登入頁
├── t/[token]/                  # 公開票券頁（領票人出示用，免驗票）
└── api/auth/[...nextauth]/     # NextAuth API 路由
```

### Docker / 部署

- `output: "standalone"`（見 `next.config.ts`）。
- `Dockerfile.dev`（開發）、`Dockerfile.prod`（正式，多階段瘦身）、`Dockerfile.pgcron`（含 pg_cron 的 Postgres）。
- `docker-compose.yml`（共用）+ `docker-compose.dev.yml`（開發，含 Prisma Studio 與 cloudflared）+ `docker-compose.prod.yml`（正式）。
- 完整開發 / 部署流程封裝於 `Makefile`（見下方常用指令）。

---

## 核心資料模型 (Data Schema)

### ER 關聯總覽

```
WhitelistedEmail              （獨立，控制後台登入權限）

User ─┬── Account              （NextAuth OAuth 帳號）
      └── Session              （NextAuth Session）

Event ─┬── TicketBatch[]       （票券批次）
       ├── Ticket[]            （單張票券）
       └── TicketCounter[]     （per event+type 流水號計數器）

TicketBatch ── Ticket[]        （批次內票券，onDelete: SetNull）
```

### 主要資料表

| 資料表 | 主鍵 | 說明 |
|--------|------|------|
| **WhitelistedEmail** | UUID | Email 白名單，控制後台 Google OAuth 登入權限 |
| **User / Account / Session** | UUID | NextAuth 後台管理員模型（JWT 策略；Account/Session 預留） |
| **Event** | Auto-increment | 活動場次，含標題、主視覺（選填）、地點、時間、注意事項、`themeColor`（主題色 key） |
| **TicketBatch** | Auto-increment | 票券批次。團體票每次「新增」建立一筆（團體名稱 + 數量），追加票數時**另建新批次，不修改既有批次**；早鳥票一次名單上傳為一批次 |
| **Ticket** | Auto-increment | 單張票券，含 `serialNo`（唯一）、`accessToken`（票券頁網址 / QR，唯一）、團體名稱、領票人姓名 / Email、寄發時間 |
| **TicketCounter** | Auto-increment | 票券流水號計數器（`@@unique([eventId, type])`），以 `$transaction` + `upsert` 原子遞增 |

列舉（Prisma enum）：`TicketType { EARLY_BIRD, GROUP }`、`UserRole { admin, superadmin }`。

### Prisma 多檔案 Schema

```
prisma/schema/
├── base.prisma     # Generator（prisma-client）+ Datasource（無 url，改由 driver adapter 連線）
├── auth.prisma     # 認證模型（User, Account, Session, VerificationToken, WhitelistedEmail）
└── event.prisma    # 業務模型（Event, TicketBatch, Ticket, TicketCounter）
```

- Prisma 7 連線字串不寫在 schema：CLI 由 `prisma.config.ts`（含 `process.loadEnvFile()`）提供，執行期由 `lib/prisma.ts` 透過 `PrismaPg` adapter 連線。
- 新版 `prisma-client` generator 輸出 TypeScript 至 `prisma/generated/prisma_client/`（已 gitignore），`tsconfig` 將 `@prisma/client` 別名指向其 `client` 進入點。

---

## 關鍵業務邏輯 (Business Logic)

### 1. 主題顏色（Config-Driven，10 組「淺底深色」）
`config/theme-colors.ts` 為唯一來源，每組色彩帶有票券所需的 Tailwind `bg` / `text` / `accent` class；`Event.themeColor` 存 key，Zod 以此驗證。

### 2. 票券種類
`config/ticket-types.ts` 對應 Prisma `TicketType` enum（`EARLY_BIRD` / `GROUP`），統一標籤與說明。

### 3. 票券流水號（原子遞增）
`lib/serial.ts` 的 `nextTicketSerial(tx, eventId, type)` 必須於 `$transaction` 內呼叫，透過 `TicketCounter` per event+type 原子遞增，格式 `{eventId}-{E|G}-{流水號:4碼}`（例：`12-G-0007`）。

### 4. 票券發放
- **團體票**：後台輸入團體名稱 + 數量 → 建立批次與票券 → 匯出 Excel（序號 + 網址 + 預留領票人姓名 / Email 欄）。
- **早鳥票**：上傳 Excel 名單 → 逐列驗證 → 按下發送後以 Email 寄出票券連結。

### 5. 免驗票
所有票券皆不需驗票；`/t/[token]` 為公開頁，以 `Ticket.accessToken` 取票，無任何登入或掃碼查驗。

### 6. 權限校驗
`proxy.ts` 攔截未登入請求 → Google OAuth + `WhitelistedEmail` 白名單制 → JWT callback 同步 DB 使用者 `id` / `role`。

---

## 開發規範 (Coding Standards)

- 程式碼註解與文件一律使用**繁體中文**，檔案標頭含元件名稱、日期、路徑。
- **Server Components 優先**，僅互動時標記 `"use client"`。
- **Server Actions** 統一回傳 `ActionResponse`（`lib/action-response.ts`，附 `ok()` / `fail()` 輔助）：驗證 session → Zod 驗證 → 變更（多表寫入用 `$transaction`）→ `revalidatePath()` → 回傳。
- **Config-Driven Enums** 集中於 `config/`；**Zod Schema** 置於 `lib/schemas/`（前後端共用）；跨元件查詢置於 `lib/data/`。
- 版本號遵循 SemVer，唯一來源 `config/version.json`。

---

## 快速開始 (Getting Started)

### 環境需求
Node 20.9+、PostgreSQL、（選用）Docker。

### 本機開發

以下只做一次

```bash
cp .env.example .env          # 填入 DATABASE_URL 與 Google OAuth / AUTH_SECRET
npm install
```

重新建立開發環境

```bash
make clean
```

用以下指令來建立開發環境資料庫

```bash
make prisma-dev-status: ## 檢查 Dev Migration 狀態（建議先跑）
make prisma-dev-deploy: ## 部署 Migrations 到 DEV
make prisma-dev-seed: ## 部署 Seed 資料到 DEV
make prisma-dev-studio: ## 選用
```

起動伺服器

```bash
make dev
```

---

## 當前狀態與待辦 (Current Status & Backlog)

### 目前版本：v0.1.0（基礎建設完成）

已完成 scaffold：Next.js 16 專案、Prisma 多檔案 Schema 與資料模型、NextAuth Google OAuth + 白名單後台登入、`proxy.ts` 路由守衛、Config-Driven 列舉、Zod schema、資料存取層、流水號產生器，以及登入 / 後台儀表板 / 公開票券頁的路由骨架。

### 尚未實作（刻意保留的 scaffold 缺口）

- 活動建立 / 編輯的後台表單與 Server Action。
- 團體票批次建立 + Excel 匯出（序號 / 網址 / 領票人欄）。
- 早鳥票名單 Excel 匯入 + Email 寄發。
- 票券頁 **QR Code 渲染**（目前為預留方框）。
- 後台票券管理 UI。
- 自動化測試（單元 / 整合 / e2e）尚未建立。
