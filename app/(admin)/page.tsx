/*
 * ----------------------------------------------
 * 後台儀表板（場次列表）
 * 2026-05-26
 * app/(admin)/page.tsx
 * ----------------------------------------------
 */
import { getEvents } from "@/lib/data/events";
import { getThemeColor } from "@/config/theme-colors";

export default async function DashboardPage() {
  const events = await getEvents();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">活動場次</h1>

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
                className={`rounded-lg border-l-4 p-4 shadow-sm ${theme.bg} ${theme.text} ${theme.accent}`}
              >
                <div className="font-semibold">{event.title}</div>
                <div className="text-sm opacity-80">{event.location}</div>
                <div className="text-sm opacity-80">
                  {event.eventAt.toLocaleString("zh-TW")}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
