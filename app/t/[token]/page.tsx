/*
 * ----------------------------------------------
 * 公開票券頁（領票人出示用，免登入、免驗票）
 * 2026-05-26
 * app/t/[token]/page.tsx
 * ----------------------------------------------
 * Mobile-First：以「手機上直接呈現票卷模樣」為核心。
 * QR Code 區塊預留位置，後續以 QR 函式庫渲染 accessToken 連結。
 */
import { notFound } from "next/navigation";
import { getTicketByToken } from "@/lib/data/events";
import { getThemeColor } from "@/config/theme-colors";
import { getTicketType } from "@/config/ticket-types";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const ticket = await getTicketByToken(token);
  if (!ticket) notFound();

  const theme = getThemeColor(ticket.event.themeColor);
  const typeInfo = getTicketType(ticket.type);

  return (
    <div className="flex min-h-full items-center justify-center bg-neutral-100 p-4">
      <div
        className={`w-full max-w-sm overflow-hidden rounded-2xl border-t-8 shadow-lg ${theme.bg} ${theme.text} ${theme.accent}`}
      >
        {ticket.event.keyVisualUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ticket.event.keyVisualUrl}
            alt={ticket.event.title}
            className="h-40 w-full object-cover"
          />
        )}

        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <span className="rounded-full border px-3 py-0.5 text-xs font-medium">
              {typeInfo?.label}
            </span>
            <span className="font-mono text-xs opacity-70">{ticket.serialNo}</span>
          </div>

          <h1 className="text-xl font-bold">{ticket.event.title}</h1>

          <dl className="space-y-1 text-sm">
            <Row label="日期時間" value={ticket.event.eventAt.toLocaleString("zh-TW")} />
            <Row label="地點" value={ticket.event.location} />
            {ticket.groupName && <Row label="團體名稱" value={ticket.groupName} />}
            {ticket.claimerName && <Row label="領票人" value={ticket.claimerName} />}
            {ticket.event.notes && <Row label="備註" value={ticket.event.notes} />}
          </dl>

          {/* QR Code 預留區（以 accessToken 連結產生） */}
          <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-lg border-2 border-dashed text-xs opacity-60">
            QR Code
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="opacity-60">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
