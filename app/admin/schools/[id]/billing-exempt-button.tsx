"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { setSchoolBillingExempt } from "@/lib/actions/billing";
import { SHULEOS_PLAN_AMOUNT_USD } from "@/lib/billing/types";
import { toast } from "@/lib/toast";

export function BillingExemptToggle({
  schoolId,
  billingExempt,
  compact = false,
}: {
  schoolId: string;
  billingExempt: boolean;
  /** Compact mode for the schools list table. */
  compact?: boolean;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [isPending, startTransition] = useTransition();
  const busy = pending || isPending;

  async function onToggle(nextExempt: boolean) {
    setPending(true);
    const result = await setSchoolBillingExempt(schoolId, nextExempt);
    setPending(false);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(
      nextExempt ? t("billingExemptOnToast") : t("billingExemptOffToast")
    );
    startTransition(() => {
      router.refresh();
    });
  }

  if (compact) {
    return (
      <Checkbox
        checked={billingExempt}
        disabled={busy}
        onChange={(e) => onToggle(e.target.checked)}
        label={t("billingExemptCompactLabel")}
        aria-label={t("billingExemptCompactLabel")}
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-500 dark:text-stone-400">
        {t("billingPlanFixed", { amount: SHULEOS_PLAN_AMOUNT_USD })}
      </p>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3 dark:border-stone-800">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          checked={billingExempt}
          disabled={busy}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium text-stone-800 dark:text-stone-200">
            {t("billingExemptLabel")}
          </span>
          <span className="mt-0.5 block text-xs text-stone-500 dark:text-stone-400">
            {billingExempt
              ? t("billingExemptHintOn")
              : t("billingExemptHintOff")}
          </span>
        </span>
      </label>
    </div>
  );
}
