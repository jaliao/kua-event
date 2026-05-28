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

export async function BatchSection({ eventId }: { eventId: number }) {
  const batches = await getBatchesByEvent(eventId);

  return (
    <section className="mx-auto max-w-md space-y-4 border-t pt-6">
      <h2 className="text-lg font-bold">團體票批次</h2>

      {batches.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          尚無團體票批次。填寫下方表單建立第一筆批次。
        </p>
      ) : (
        <ul className="space-y-2">
          {batches.map((batch) => (
            <li
              key={batch.id}
              className="flex items-center justify-between gap-3 rounded-md border p-3"
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{batch.groupName}</div>
                <div className="text-xs text-muted-foreground">
                  {batch._count.tickets} 張 ·{" "}
                  {batch.createdAt.toLocaleString("zh-TW")}
                </div>
              </div>
              <a
                href={`/events/${eventId}/batches/${batch.id}/export`}
                className="shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
              >
                匯出 Excel
              </a>
            </li>
          ))}
        </ul>
      )}

      <GroupBatchForm eventId={eventId} />
    </section>
  );
}
