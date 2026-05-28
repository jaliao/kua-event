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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
        <p className="rounded-md bg-amber-50 p-2 text-sm text-amber-800">
          編輯內容會即時影響已發出票券的票面顯示（標題、時間、主題色等）。
        </p>
      )}

      <Field label="活動代號" htmlFor="code" error={errors.code?.message}>
        <Input
          id="code"
          type="text"
          placeholder="例：NY01"
          className="uppercase"
          {...register("code")}
        />
        <span className="block text-xs text-muted-foreground">
          僅限英文與數字（不含符號），系統會自動轉為大寫。作為票券編號前綴，例：NY01 → 票券 NY010001。
        </span>
      </Field>

      <Field label="活動標題" htmlFor="title" error={errors.title?.message}>
        <Input id="title" type="text" {...register("title")} />
      </Field>

      <Field
        label="主視覺網址（選填）"
        htmlFor="keyVisualUrl"
        error={errors.keyVisualUrl?.message}
      >
        <Input
          id="keyVisualUrl"
          type="url"
          placeholder="https://..."
          {...register("keyVisualUrl")}
        />
      </Field>

      <Field label="地點" htmlFor="location" error={errors.location?.message}>
        <Input id="location" type="text" {...register("location")} />
      </Field>

      <Field label="活動時間" htmlFor="eventAt" error={errors.eventAt?.message}>
        <Input id="eventAt" type="datetime-local" {...register("eventAt")} />
      </Field>

      <Field label="注意事項（選填）" htmlFor="notes" error={errors.notes?.message}>
        <Textarea id="notes" rows={3} {...register("notes")} />
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
                  ? "ring-2 ring-offset-2 ring-ring"
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
        <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          {globalError}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "處理中…" : eventId ? "儲存變更" : "建立活動"}
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <span className="block text-sm text-destructive">{error}</span>}
    </div>
  );
}
