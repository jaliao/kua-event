/*
 * ----------------------------------------------
 * 後台儀表板（場次列表）
 * 2026-05-26
 * app/(admin)/page.tsx
 * ----------------------------------------------
 */
import Link from "next/link";
import { getEvents } from "@/lib/data/events";
import { getThemeColor } from "@/config/theme-colors";

export default async function DashboardPage() {
  const events = await getEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">活動場次</h1>
        <Link
          href="/events/new"
          className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent"
        >
          新增活動
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-muted-foreground">
          尚無活動。建立活動後即可開始發放團體票與早鳥票。
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => {
            const theme = getThemeColor(event.themeColor);
            return (
              <li
                key={event.id}
                className={`flex flex-col rounded-lg border-l-4 p-4 shadow-sm ${theme.bg} ${theme.text} ${theme.accent}`}
              >
                <div className="text-xs font-medium opacity-70">
                  {event.code}
                </div>
                <div className="font-semibold">{event.title}</div>
                <div className="text-sm opacity-80">
                  {event.eventAt.toLocaleDateString("zh-TW")}
                </div>
                <div className="mt-1 text-sm opacity-80">
                  票券 {event.counts.total} 張（團體 {event.counts.group} ／ 早鳥{" "}
                  {event.counts.earlyBird}）
                </div>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  <Link
                    href={`/events/${event.id}/edit`}
                    className="underline opacity-80 hover:opacity-100"
                  >
                    編輯
                  </Link>
                  <Link
                    href={`/events/${event.id}/batches`}
                    className="underline opacity-80 hover:opacity-100"
                  >
                    團體票
                  </Link>
                  <Link
                    href={`/events/${event.id}/early-bird`}
                    className="underline opacity-80 hover:opacity-100"
                  >
                    早鳥票
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
