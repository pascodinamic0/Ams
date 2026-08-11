"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteBudgetPlan } from "@/lib/actions/budget";
import { toast } from "@/lib/toast";

type Props = {
  id: string;
  label: string;
  confirmLabel: string;
  successLabel: string;
  failedLabel: string;
};

export function DeleteBudgetPlanButton({
  id,
  label,
  confirmLabel,
  successLabel,
  failedLabel,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmLabel)) return;
        startTransition(async () => {
          const result = await deleteBudgetPlan(id);
          if (result.error) {
            toast.error(
              typeof result.error === "string" ? result.error : failedLabel
            );
            return;
          }
          toast.success(successLabel);
          router.refresh();
        });
      }}
    >
      {label}
    </Button>
  );
}
