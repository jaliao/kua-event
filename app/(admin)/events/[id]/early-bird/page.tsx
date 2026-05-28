/*
 * ----------------------------------------------
 * 早鳥票頁（佔位）
 * 2026-05-28
 * app/(admin)/events/[id]/early-bird/page.tsx
 * ----------------------------------------------
 * 早鳥票名單上傳與 Email 寄發尚未實作，本頁僅標示未開放。
 * 查無活動則 notFound。
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/data/events";

export default async function EarlyBirdPage({
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

      <div className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
        <p className="font-medium">早鳥票功能尚未開放</p>
        <p className="mt-1 text-sm">
          名單上傳與 Email 寄發功能開發中，敬請期待。
        </p>
      </div>
    </div>
  );
}
