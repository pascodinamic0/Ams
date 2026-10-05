"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { updateEnrollmentFee } from "@/lib/actions/students";
import { formatMoney } from "@/lib/currency";
import type { FeeStructureListItem } from "@/lib/db/fee-structures";
import { toast } from "@/lib/toast";

export function StudentEnrollmentFeeEditor({
  studentId,
  currentFeeStructureId,
  feeStructures,
  currencyCode,
}: {
  studentId: string;
  currentFeeStructureId: string | null;
  feeStructures: FeeStructureListItem[];
  currencyCode: string;
}) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [feeStructureId, setFeeStructureId] = useState(
    currentFeeStructureId ?? ""
  );
  const [loading, setLoading] = useState(false);
  const dirty = feeStructureId !== (currentFeeStructureId ?? "");

  async function save() {
    if (!feeStructureId) {
      toast.error(t("selectFeeStructure"));
      return;
    }

    setLoading(true);
    const result = await updateEnrollmentFee(studentId, feeStructureId);
    setLoading(false);

    if ("error" in result && result.error) {
      const message =
        typeof result.error === "string"
          ? result.error
          : Object.values(result.error as Record<string, string[]>)
              .flat()
              .filter(Boolean)[0] ?? t("enrollmentFeeUpdateFailed");
      toast.error(message);
      return;
    }

    toast.success(t("enrollmentFeeUpdated"));
    router.refresh();
  }

  return (
    <div className="mb-4 space-y-3 rounded-lg border border-stone-200 p-4 dark:border-stone-800">
      <div>
        <p className="text-sm font-medium text-stone-900 dark:text-white">
          {t("changeEnrollmentFee")}
        </p>
        <p className="mt-0.5 text-xs text-stone-500">
          {t("changeEnrollmentFeeDesc")}
        </p>
      </div>
      <Select
        id="enrollment-fee-structure"
        value={feeStructureId}
        onChange={(e) => setFeeStructureId(e.target.value)}
        placeholder={t("selectFeeStructure")}
        options={feeStructures.map((fee) => ({
          value: fee.id,
          label: `${fee.name} — ${formatMoney(fee.amount, currencyCode)}`,
        }))}
      />
      <Button
        type="button"
        size="sm"
        disabled={loading || !dirty}
        onClick={save}
      >
        {loading ? tc("saving") : t("updateEnrollmentFee")}
      </Button>
    </div>
  );
}
