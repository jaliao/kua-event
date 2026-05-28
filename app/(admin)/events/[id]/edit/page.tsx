/*
 * ----------------------------------------------
 * 編輯活動頁
 * 2026-05-27
 * app/(admin)/events/[id]/edit/page.tsx
 * ----------------------------------------------
 * 以 getEventById 取資料，查無則 notFound。
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/lib/data/events";
import { EventForm } from "../../event-form";
import type { ThemeColorKey } from "@/config/theme-colors";

// Date → datetime-local 需要的本地 yyyy-MM-ddTHH:mm
function toDateTimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export default async function EditEventPage({
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
        <h1 className="text-2xl font-bold">編輯活動</h1>
        <Link href="/" className="text-sm underline">
          返回列表
        </Link>
      </div>
      <EventForm
        eventId={event.id}
        defaultValues={{
          code: event.code,
          title: event.title,
          keyVisualUrl: event.keyVisualUrl ?? "",
          location: event.location,
          eventAt: toDateTimeLocal(event.eventAt),
          notes: event.notes ?? "",
          themeColor: event.themeColor as ThemeColorKey,
        }}
      />
    </div>
  );
}
