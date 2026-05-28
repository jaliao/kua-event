/*
 * ----------------------------------------------
 * 團體票管理頁
 * 2026-05-28
 * app/(admin)/events/[id]/batches/page.tsx
 * ----------------------------------------------
 * 集中團體票批次的建立、清單與匯出（重用 BatchSection）。
 * 查無活動則 notFound。
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/data/events";
import { BatchSection } from "../batches/batch-section";

export default async function BatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId)) notFound();

  const event = await getEventById(eventId);
  if (!event) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <span className="mr-2 text-base font-medium text-muted-foreground">
            {event.code}
          </span>
          {event.title}
        </h1>
        <Link href="/" className="text-sm underline">
          返回列表
        </Link>
      </div>
      <BatchSection eventId={event.id} />
    </div>
  );
}
