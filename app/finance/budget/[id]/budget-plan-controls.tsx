"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateBudgetPlan } from "@/lib/actions/budget";
import { toast } from "@/lib/toast";
import type { BudgetPlanStatus } from "@/lib/db/budget";

type Props = {
  planId: string;
  status: BudgetPlanStatus;
  labels: {
    draft: string;
    active: string;
    archived: string;
    updated: string;
    failed: string;
  };
};

export function BudgetPlanStatusSelect({ planId, status, labels }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as BudgetPlanStatus;
        startTransition(async () => {
          const result = await updateBudgetPlan(planId, { status: next });
          if ("error" in result && result.error) {
            toast.error(
              typeof result.error === "string" ? result.error : labels.failed
            );
            return;
          }
          toast.success(labels.updated);
          router.refresh();
        });
      }}
      className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900 print:hidden"
    >
      <option value="draft">{labels.draft}</option>
      <option value="active">{labels.active}</option>
      <option value="archived">{labels.archived}</option>
    </select>
  );
}

export function BudgetPrintHint({ label }: { label: string }) {
  return (
    <Button
      type="button"
      size="sm"
      className="print:hidden"
      onClick={() => window.print()}
    >
      {label}
    </Button>
  );
}
