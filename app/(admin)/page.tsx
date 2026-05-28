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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const events = await getEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">活動場次</h1>
        <Button asChild>
          <Link href="/events/new">新增活動</Link>
        </Button>
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
              <li key={event.id}>
                <Card
                  className={cn("h-full border-l-4", theme.bg, theme.text, theme.accent)}
                >
                  <CardHeader>
                    <div className="text-xs font-medium opacity-70">
                      {event.code}
                    </div>
                    <CardTitle>{event.title}</CardTitle>
                    <div className="text-sm opacity-80">
                      {event.eventAt.toLocaleDateString("zh-TW")}
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm opacity-80">
                    票券 {event.counts.total} 張（團體 {event.counts.group} ／ 早鳥{" "}
                    {event.counts.earlyBird}）
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/events/${event.id}/edit`}>編輯</Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/events/${event.id}/batches`}>團體票</Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/events/${event.id}/early-bird`}>早鳥票</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
