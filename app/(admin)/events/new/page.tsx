/*
 * ----------------------------------------------
 * 新增活動頁
 * 2026-05-27
 * app/(admin)/events/new/page.tsx
 * ----------------------------------------------
 */
import Link from "next/link";
import { EventForm } from "../event-form";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">新增活動</h1>
        <Link href="/" className="text-sm underline">
          返回列表
        </Link>
      </div>
      <EventForm />
    </div>
  );
}
