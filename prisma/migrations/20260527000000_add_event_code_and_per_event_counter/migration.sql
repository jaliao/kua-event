-- 活動代號與每活動單一流水號計數器
-- Event 新增 code（唯一）；TicketCounter 由 per event+type 改為 per event

-- DropIndex
DROP INDEX "TicketCounter_eventId_type_key";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketCounter" DROP COLUMN "type";

-- CreateIndex
CREATE UNIQUE INDEX "Event_code_key" ON "Event"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TicketCounter_eventId_key" ON "TicketCounter"("eventId");
