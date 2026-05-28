/*
 * ----------------------------------------------
 * 團體票批次 Excel 匯出 Route Handler
 * 2026-05-28
 * app/(admin)/events/[id]/batches/[batchId]/export/route.ts
 * ----------------------------------------------
 * GET：驗證 session → 取批次與票券 → 回傳 .xlsx 下載。
 * 檔案下載天然是 GET + 二進位，故走 Route Handler 而非 Server Action。
 */
import { auth } from "@/auth";
import { getBatchWithTickets } from "@/lib/data/batches";
import { buildBatchWorkbook } from "@/lib/excel";

const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; batchId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return new Response("未授權", { status: 401 });
  }

  const { batchId } = await params;
  const id = Number(batchId);
  if (!Number.isInteger(id)) {
    return new Response("查無此批次", { status: 404 });
  }

  const batch = await getBatchWithTickets(id);
  if (!batch) {
    return new Response("查無此批次", { status: 404 });
  }

  const buffer = await buildBatchWorkbook(batch.tickets);

  const baseName = `${batch.event.code}-${batch.groupName ?? "團體票"}-${batch.id}`;
  const fileName = `${baseName}.xlsx`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": XLSX_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}
