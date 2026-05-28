/*
 * ----------------------------------------------
 * 活動建立／編輯表單（共用）
 * 2026-05-27
 * app/(admin)/events/event-form.tsx
 * ----------------------------------------------
 * 有 eventId 走 updateEvent，否則走 createEvent。
 * RHF + zodResolver(eventSchema)，主題色即時預覽，Mobile-First。
 */
"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, type EventInput } from "@/lib/schemas/event";
import { getThemeColorOptions, getThemeColor } from "@/config/theme-colors";
import { createEvent, updateEvent } from "./actions";
import { cn } from "@/lib/utils";

type EventFormValues = {
  code: string;
  title: string;
  keyVisualUrl: string;
  location: string;
  eventAt: string; // datetime-local 字串
  notes: string;
  themeColor: EventInput["themeColor"];
};

type EventFormProps = {
  eventId?: number;
  defaultValues?: Partial<EventFormValues>;
};

const themeOptions = getThemeColorOptions();

export function EventForm({ eventId, defaultValues }: EventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<EventFormValues>({
    // eventAt 在 schema 為 coerce.date，這裡以字串輸入交由 action 端轉換
    resolver: zodResolver(eventSchema as never),
    defaultValues: {
      code: "",
      title: "",
      keyVisualUrl: "",
      location: "",
      eventAt: "",
      notes: "",
      themeColor: "slate",
      ...defaultValues,
    },
  });

  const selectedTheme = watch("themeColor");
  const previewTheme = getThemeColor(selectedTheme);
  const titlePreview = watch("title") || "活動標題";

  function onSubmit(values: EventFormValues) {
    setGlobalError(null);
    startTransition(async () => {
      const res = eventId
        ? await updateEvent(eventId, values as unknown as EventInput)
        : await createEvent(values as unknown as EventInput);

      if (res.success) {
        router.push("/");
        router.refresh();
        return;
      }

      // 回填 Zod 欄位錯誤
      if (res.errors) {
        for (const [field, messages] of Object.entries(res.errors)) {
          if (messages?.[0]) {
            setError(field as keyof EventFormValues, {
              type: "server",
              message: messages[0],
            });
          }
        }
      }
      setGlobalError(res.message ?? "操作失敗");
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-md space-y-5"
      noValidate
    >
      {eventId && (
        <p className="rounded bg-amber-50 p-2 text-sm text-amber-800">
          編輯內容會即時影響已發出票券的票面顯示（標題、時間、主題色等）。
        </p>
      )}

      <Field label="活動代號" error={errors.code?.message}>
        <input
          type="text"
          placeholder="例：NY01"
          className={cn(inputCls, "uppercase")}
          {...register("code")}
        />
        <span className="block text-xs text-muted-foreground">
          僅限英文與數字（不含符號），系統會自動轉為大寫。作為票券編號前綴，例：NY01 → 票券 NY010001。
        </span>
      </Field>

      <Field label="活動標題" error={errors.title?.message}>
        <input type="text" className={inputCls} {...register("title")} />
      </Field>

      <Field label="主視覺網址（選填）" error={errors.keyVisualUrl?.message}>
        <input
          type="url"
          placeholder="https://..."
          className={inputCls}
          {...register("keyVisualUrl")}
        />
      </Field>

      <Field label="地點" error={errors.location?.message}>
        <input type="text" className={inputCls} {...register("location")} />
      </Field>

      <Field label="活動時間" error={errors.eventAt?.message}>
        <input
          type="datetime-local"
          className={inputCls}
          {...register("eventAt")}
        />
      </Field>

      <Field label="注意事項（選填）" error={errors.notes?.message}>
        <textarea rows={3} className={inputCls} {...register("notes")} />
      </Field>

      <Field label="主題色" error={errors.themeColor?.message}>
        <div className="flex flex-wrap gap-2">
          {themeOptions.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() =>
                setValue("themeColor", opt.value, { shouldValidate: true })
              }
              aria-pressed={selectedTheme === opt.value}
              title={opt.label}
              className={cn(
                "h-8 w-8 rounded-full border-2",
                opt.bg,
                selectedTheme === opt.value
                  ? "ring-2 ring-offset-2 ring-slate-900"
                  : "border-transparent",
              )}
            />
          ))}
        </div>
      </Field>

      {/* 主題色即時票面預覽 */}
      <div
        className={cn(
          "rounded-lg border-l-4 p-4 shadow-sm",
          previewTheme.bg,
          previewTheme.text,
          previewTheme.accent,
        )}
      >
        <div className="text-xs opacity-70">票面預覽（{previewTheme.label}）</div>
        <div className="mt-1 font-semibold">{titlePreview}</div>
      </div>

      {globalError && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700">
          {globalError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md border px-4 py-2 font-medium hover:bg-accent disabled:opacity-50"
      >
        {isPending ? "處理中…" : eventId ? "儲存變更" : "建立活動"}
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="block text-sm text-red-600">{error}</span>}
    </label>
  );
}
