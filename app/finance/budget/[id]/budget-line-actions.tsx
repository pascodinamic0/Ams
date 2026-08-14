"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  createTaskFromBudgetLine,
  deleteBudgetLineItem,
} from "@/lib/actions/budget";
import { toast } from "@/lib/toast";

type Props = {
  lineId: string;
  taskId: string | null;
  labels: {
    createTask: string;
    taskLinked: string;
    delete: string;
    confirmDelete: string;
    deleted: string;
    taskCreated: string;
    failed: string;
  };
};

export function BudgetLineActions({ lineId, taskId, labels }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-1 print:hidden">
      {taskId ? (
        <span className="px-2 py-1 text-xs text-emerald-700 dark:text-emerald-300">
          {labels.taskLinked}
        </span>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const result = await createTaskFromBudgetLine(lineId);
              if ("error" in result && result.error) {
                toast.error(
                  typeof result.error === "string" ? result.error : labels.failed
                );
                return;
              }
              toast.success(labels.taskCreated);
              router.refresh();
            });
          }}
        >
          {labels.createTask}
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(labels.confirmDelete)) return;
          startTransition(async () => {
            const result = await deleteBudgetLineItem(lineId);
            if ("error" in result && result.error) {
              toast.error(
                typeof result.error === "string" ? result.error : labels.failed
              );
              return;
            }
            toast.success(labels.deleted);
            router.refresh();
          });
        }}
      >
        {labels.delete}
      </Button>
    </div>
  );
}
