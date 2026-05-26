# BC-ERP

## 📚 目錄

- [資料庫管理](#資料庫管理)
- [開發環境設置](#開發環境設置)
- [常見問題](#常見問題)

---

## 常用咒術

以上變更，我要 check in 給我一個 commit 的繁體中文文字訊息。

-

摘要到目前為止的實作的功能項目清單，列點就好，我要做工作日誌用途。

-

 * ----------------------------------------------
 * Sign Out Button Component Old
 * 2026-01-13
 * components/dashboard/sign-out-button.tsx
 * ----------------------------------------------
 */

註解格式如上，時間記得更新

-

## 🗄️ 資料庫管理

### 1️⃣ 變更資料庫結構

當修改 Prisma Schema 後，需要更新資料庫結構：

```bash
# 方式 1：使用 Makefile（推薦）
make schema-update
```

**執行流程：**
1. ✅ 生成新的 Migration 檔案
2. ✅ 套用至資料庫
3. ✅ 重新生成 Prisma Client

---

### 2️⃣ 開發環境重置資料庫

**完整重置流程（刪除所有資料）：**

```bash
# 步驟 1: 清理容器和資料
make clean

# 步驟 2: 啟動開發環境
make dev

# 步驟 3: 套用 Schema 到資料庫
make schema-update

# 步驟 4: 填充測試資料
make prisma-seed
```

---

### 3️⃣ 僅更新測試資料

```bash
# 本地環境
make prisma-seed
```

```bash
# VPS
make prisma-vps3-seed
```

---

### 4️⃣ 查看資料庫內容

```bash
# 啟動 Prisma Studio（圖形化界面）
make prisma-studio
```

---

## 🚀 開發環境設置

### 首次設置

```bash
# 1. 安裝依賴
npm install

# 2. 設置環境變數
cp .env.example .env
# 編輯 .env，設定 DATABASE_URL

# 3. 啟動 Docker 容器
make dev

# 4. 初始化資料庫
make schema-update

# 5. 填充測試資料
make prisma-docker-seed

# 6. 啟動開發伺服器
npm run dev
```

---

## 🛠️ Makefile 指令參考

| 指令 | 說明 |
|------|------|
| `make dev` | 啟動 Docker 開發環境 |
| `make clean` | 清理所有容器和資料卷 |
| `make schema-update` | 更新資料庫 Schema |
| `make prisma-docker-seed` | 在 Docker 容器中執行 Seed |
| `make prisma-studio` | 開啟 Prisma Studio |
| `make prisma-generate` | 重新生成 Prisma Client |

---

## ❓ 常見問題

### Q1: Migration 失敗怎麼辦?

```bash
# 1. 檢查資料庫連線
docker ps  # 確認容器運行中
docker logs bc-erp-postgres  # 查看日誌

# 2. 重置資料庫
make clean
make dev
make schema-update
```

### Q2: Prisma Client 找不到型別?

```bash
# 重新生成 Client
npx prisma generate

# 或使用 Makefile
make prisma-generate
```

### Q3: Seed 執行失敗?

```bash
# 檢查環境變數
echo $DATABASE_URL

# 驗證 Schema
npx prisma validate

# 重新執行 Seed
make prisma-docker-seed
```

### Q4: 如何查看當前 Schema 狀態?

```bash
# 驗證 Schema
npx prisma validate

# 查看待套用的 Migration
npx prisma migrate status

# 查看資料庫資料
make prisma-studio
```

---

## 📁 Prisma 檔案結構

```
prisma/
├── schema/
│   ├── base.prisma        # 基礎配置
│   ├── user.prisma        # 使用者相關 Schema
│   └── project.prisma     # 專案相關 Schema
├── migrations/            # Migration 歷史記錄
├── seed.ts               # 測試資料腳本
└── prisma.config.ts      # Prisma 7 配置檔
```

---

## 🔗 相關連結

- [Prisma 官方文檔](https://www.prisma.io/docs)
- [Prisma 7 升級指南](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Next.js 官方文檔](https://nextjs.org/docs)

---

## 📝 注意事項

1. **生產環境不要使用 `prisma migrate reset`**
2. **執行 Migration 前先備份資料**
3. **Seed 資料僅供開發測試使用**
4. **確保 `.env` 文件不要提交到 Git**

---

## 🎯 快速參考

```bash
# 日常開發流程
make dev                    # 啟動環境
npm run dev                # 啟動 Next.js

# 修改 Schema 後
make schema-update         # 套用變更

# 重置開發環境
make clean && make dev && make schema-update && make prisma-docker-seed
```
