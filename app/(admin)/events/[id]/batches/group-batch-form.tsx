/*
 * ----------------------------------------------
 * 團體票批次建立表單
 * 2026-05-28
 * app/(admin)/events/[id]/batches/group-batch-form.tsx
 * ----------------------------------------------
 * RHF + zodResolver(groupBatchSchema)，提交呼叫 createGroupBatch。
 * 批次為 additive：每次提交建立一筆新批次，不修改既有批次。
 */
"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  groupBatchSchema,
  MAX_BATCH_QUANTITY,
  type GroupBatchInput,
} from "@/lib/schemas/batch";
import { createGroupBatch } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type GroupBatchFormValues = {
  groupName: string;
  quantity: number;
};

export function GroupBatchForm({ eventId }: { eventId: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<GroupBatchFormValues>({
    resolver: zodResolver(groupBatchSchema as never),
    defaultValues: { groupName: "", quantity: 1 },
  });

  function onSubmit(values: GroupBatchFormValues) {
    setGlobalError(null);
    startTransition(async () => {
      const res = await createGroupBatch(
        eventId,
        values as unknown as GroupBatchInput,
      );

      if (res.success) {
        reset({ groupName: "", quantity: 1 });
        router.refresh();
        return;
      }

      if (res.errors) {
        for (const [field, messages] of Object.entries(res.errors)) {
          if (messages?.[0]) {
            setError(field as keyof GroupBatchFormValues, {
              type: "server",
              message: messages[0],
            });
          }
        }
      }
      setGlobalError(res.message ?? "建立失敗");
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-md border p-4"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="groupName">團體名稱</Label>
        <Input id="groupName" type="text" {...register("groupName")} />
        {errors.groupName && (
          <span className="block text-sm text-destructive">
            {errors.groupName.message}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="quantity">數量</Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          max={MAX_BATCH_QUANTITY}
          {...register("quantity")}
        />
        <span className="block text-xs text-muted-foreground">
          一次最多 {MAX_BATCH_QUANTITY} 張。需追加票數時請另建新批次（既有批次不可修改）。
        </span>
        {errors.quantity && (
          <span className="block text-sm text-destructive">
            {errors.quantity.message}
          </span>
        )}
      </div>

      {globalError && (
        <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          {globalError}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "建立中…" : "建立團體票批次"}
      </Button>
    </form>
  );
}
