/*
 * ----------------------------------------------
 * 團體票批次區塊（活動編輯頁底部）
 * 2026-05-28
 * app/(admin)/events/[id]/batches/batch-section.tsx
 * ----------------------------------------------
 * Server Component：列出該活動團體票批次（additive、不提供編輯/刪除），
 * 附建立表單與每批次的 Excel 匯出連結。
 */
import { getBatchesByEvent } from "@/lib/data/batches";
import { GroupBatchForm } from "./group-batch-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export async function BatchSection({ eventId }: { eventId: number }) {
  const batches = await getBatchesByEvent(eventId);

  return (
    <section className="mx-auto max-w-md space-y-4">
      <h2 className="text-lg font-bold">團體票批次</h2>

      {batches.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          尚無團體票批次。填寫下方表單建立第一筆批次。
        </p>
      ) : (
        <ul className="space-y-2">
          {batches.map((batch) => (
            <li key={batch.id}>
              <Card className="py-3">
                <CardContent className="flex items-center justify-between gap-3 px-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{batch.groupName}</div>
                    <div className="text-xs text-muted-foreground">
                      {batch._count.tickets} 張 ·{" "}
                      {batch.createdAt.toLocaleString("zh-TW")}
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="shrink-0">
                    <a href={`/events/${eventId}/batches/${batch.id}/export`}>
                      匯出 Excel
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <GroupBatchForm eventId={eventId} />
    </section>
  );
}
