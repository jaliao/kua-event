## Context

後台儀表板（`app/(admin)/page.tsx`）以卡片列出四個場次，目前每張卡片只顯示標題、地點、時間與「編輯」連結，且團體票批次管理被掛在「編輯活動頁」底部（`BatchSection`）。本變更要：卡片改顯示代號、名稱、日期與票券張數（總數 / 團體 / 早鳥），並把操作拆成「編輯 ｜ 團體票 ｜ 早鳥票」三個入口；團體票管理移到獨立頁，編輯頁回歸純活動資料編輯；早鳥票先做佔位頁。

既有零件：`getEvents()`／`getEventById()`（`lib/data/events.ts`）、團體票元件已在 `app/(admin)/events/[id]/batches/`（`batch-section.tsx`、`group-batch-form.tsx`、`actions.ts`、`[batchId]/export/route.ts`）。資料模型 `Ticket` 帶 `eventId` 與 `type`（`GROUP` / `EARLY_BIRD`）。

## Goals / Non-Goals

**Goals:**

- 儀表板卡片呈現：活動代號、活動名稱、活動日期、票券張數（總數 / 團體票 / 早鳥票）。
- 卡片操作列三入口：編輯（活動基本資料）、團體票（獨立管理頁）、早鳥票（佔位頁）。
- 團體票管理（建立批次 / 清單 / 匯出）集中於 `/events/[id]/batches`；編輯頁移除批次區塊。
- 早鳥票佔位頁 `/events/[id]/early-bird`，明確標示未實作。

**Non-Goals:**

- 早鳥票名單上傳與 Email 寄發（另開變更）。
- 團體票批次的修改／刪除（既有 `group-ticket-batch` 規格為 additive，本變更不改變）。
- 票面視覺、QR Code、公開票券頁。
- Prisma schema 變更（既有模型已足夠）。

## Decisions

### 1. 票券分項計數用單一 `groupBy`，避免 N+1
`getEvents` 取活動後，另以一次 `prisma.ticket.groupBy({ by: ["eventId", "type"], _count: { _all: true } })` 取得各活動每票種張數，於記憶體合併進活動清單（缺漏視為 0），回傳含 `{ total, group, earlyBird }` 的計數。
- **理由**：儀表板需列出所有場次的分項計數；單一 `groupBy` 不論場次數量都只多一次查詢，優於對每張卡片個別 `_count`（N+1），也優於 filtered relation count 的相容性顧慮。
- **替代方案**：`event.findMany({ include: { _count: { select: { tickets: true } } } })` — 否決，只給總數、拿不到分票種；逐活動 filtered count — 否決，N+1。

### 2. 團體票獨立頁重用既有 `BatchSection`
新增 `app/(admin)/events/[id]/batches/page.tsx`：Server Component，以 `getEventById` 取活動（查無則 `notFound`）顯示頁首（代號 + 標題 + 返回），內嵌既有 `BatchSection`。編輯頁 `app/(admin)/events/[id]/edit/page.tsx` 移除 `BatchSection` 與其 import。
- **理由**：批次元件已存在於 `batches/` 目錄，僅需補一個 `page.tsx` 入口並從編輯頁移出，改動最小。
- **連帶**：`createGroupBatch` 的 `revalidatePath` 由 `/events/${eventId}/edit` 改為 `/events/${eventId}/batches`（批次清單現在這裡呈現）。

### 3. 早鳥票佔位頁
新增 `app/(admin)/events/[id]/early-bird/page.tsx`：Server Component，顯示活動頁首與「早鳥票功能尚未開放（名單上傳與 Email 寄發開發中）」說明 + 返回連結，無任何操作。
- **理由**：讓卡片的「早鳥票」入口有合理落點，且明確傳達未實作，避免誤以為故障。
- **替代方案**：按鈕停用（disabled）— 較不明確；本次採可導向佔位頁。

### 4. 卡片操作列為三個連結
卡片底部以一列呈現「編輯 ｜ 團體票 ｜ 早鳥票」三連結，分別指向 `/events/[id]/edit`、`/events/[id]/batches`、`/events/[id]/early-bird`。Mobile-First：小螢幕並排可換行。
- **理由**：對齊需求；維持既有卡片以主題色呈現的樣式。

### 5. 計數呈現格式
卡片顯示總張數，並附團體 / 早鳥分項，如「票券 12 張（團體 12 ／ 早鳥 0）」。早鳥票未實作期間其值恆為 0，屬預期。

## Risks / Trade-offs

- **groupBy 不含零票活動** → 合併時以預設 0 補齊（`Map` 查無則 `{ total: 0, group: 0, earlyBird: 0 }`）。
- **批次管理 URL 變動**（編輯頁 → 團體票頁）→ 無外部連結依賴；`revalidatePath` 同步更新即可，建立批次後仍正確刷新清單。
- **早鳥票佔位頁誤解** → 文案明確標示「尚未開放／開發中」。
- **計數即時性** → 儀表板為 Server Component，建立批次後該活動頁 `revalidatePath`；回到儀表板若未即時更新，靠導覽刷新，非關鍵數據可接受輕微延遲。

## Migration Plan

純前端 + 資料層 + 路由調整，無 DB schema 變更、無 migration。直接部署即可；回滾僅需還原這幾個檔案。

## Open Questions

- 無（四項範圍決策已於 proposal 定案）。
