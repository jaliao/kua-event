/*
 * ----------------------------------------------
 * Excel 匯出工具（僅 server 端使用，勿進 client bundle）
 * 2026-05-28
 * lib/excel.ts
 * ----------------------------------------------
 * 團體票批次匯出四欄：序號、票券網址、領票人姓名（空）、領票人 Email（空）。
 * 後兩欄留空供團體窗口離線填寫，不回寫系統。
 */
import ExcelJS from "exceljs";
import { ticketUrl } from "@/lib/ticket-url";

type ExportTicket = {
  serialNo: string;
  accessToken: string;
};

export async function buildBatchWorkbook(
  tickets: ExportTicket[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("團體票");

  sheet.columns = [
    { header: "序號", key: "serialNo", width: 18 },
    { header: "票券網址", key: "url", width: 56 },
    { header: "領票人姓名", key: "claimerName", width: 18 },
    { header: "領票人 Email", key: "claimerEmail", width: 30 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const ticket of tickets) {
    sheet.addRow({
      serialNo: ticket.serialNo,
      url: ticketUrl(ticket.accessToken),
      claimerName: "",
      claimerEmail: "",
    });
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
