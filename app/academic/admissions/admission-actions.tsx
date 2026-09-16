"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { convertAdmissionToStudent, updateAdmissionStatus } from "@/lib/actions/admissions";
import { formatClassOptionLabel, isClassFull } from "@/lib/utils/class-options";
import type { ClassListItem } from "@/lib/db/classes";
import type { FeeStructureListItem } from "@/lib/db/fee-structures";
import { filterFeeStructuresForClass } from "@/lib/services/enrollment-fees";
import { formatMoney } from "@/lib/currency";
import { toast } from "@/lib/toast";

export function AdmissionActions({
  id,
  status,
  branchId,
  defaultClassId,
  classes,
  feeStructures,
  currencyCode = "USD",
  canOverrideCapacity = false,
}: {
  id: string;
  status: string;
  branchId: string;
  defaultClassId?: string | null;
  classes: ClassListItem[];
  feeStructures: FeeStructureListItem[];
  currencyCode?: string;
  canOverrideCapacity?: boolean;
}) {
  const t = useTranslations("academic");
  const router = useRouter();
  const [classId, setClassId] = useState(defaultClassId ?? "");
  const [feeStructureId, setFeeStructureId] = useState("");
  const [receiptRef, setReceiptRef] = useState("");
  const [overrideCapacity, setOverrideCapacity] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedClass = classes.find((c) => c.id === classId);
  const classIsFull = selectedClass ? isClassFull(selectedClass) : false;
  const applicableFeeStructures = useMemo(
    () => (classId ? filterFeeStructuresForClass(feeStructures, classId) : []),
    [classId, feeStructures]
  );

  useEffect(() => {
    if (feeStructureId && !applicableFeeStructures.some((fs) => fs.id === feeStructureId)) {
      setFeeStructureId("");
    }
  }, [classId, feeStructureId, applicableFeeStructures]);

  async function approve() {
    if (!branchId) {
      toast.error(t("branchRequiredApprove"));
      return;
    }
    if (!classId) {
      toast.error(t("selectClassRequired"));
      return;
    }
    if (!feeStructureId) {
      toast.error(t("selectFeeStructureRequired"));
      return;
    }
    if (classIsFull && !canOverrideCapacity) {
      toast.error(t("classFullNoOverride"));
      return;
    }
    if (classIsFull && canOverrideCapacity && !overrideCapacity) {
      toast.error(t("enrollAnywayFullClassHint"));
      return;
    }

    setLoading(true);
    const result = await convertAdmissionToStudent(id, branchId, classId, {
      overrideCapacity: overrideCapacity && canOverrideCapacity,
      fee_structure_id: feeStructureId,
      enrollment_receipt_ref: receiptRef.trim() || undefined,
    });
    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("applicationApprovedPending"));
    router.refresh();
  }

  async function reject() {
    setLoading(true);
    const result = await updateAdmissionStatus(id, "rejected");
    setLoading(false);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("applicationRejected"));
    router.refresh();
  }

  if (status !== "pending") {
    return <span className="text-sm capitalize text-stone-500">{status}</span>;
  }

  return (
    <div className="flex min-w-[220px] flex-col gap-2">
      <Select
        value={classId}
        onChange={(e) => setClassId(e.target.value)}
        placeholder={t("selectClass")}
        options={classes.map((c) => ({
          value: c.id,
          label: formatClassOptionLabel(c),
        }))}
      />
      <Select
        value={feeStructureId}
        onChange={(e) => setFeeStructureId(e.target.value)}
        placeholder={
          classId ? t("selectFeeStructure") : t("selectClassFirst")
        }
        disabled={!classId || applicableFeeStructures.length === 0}
        options={applicableFeeStructures.map((fs) => ({
          value: fs.id,
          label: `${fs.name} — ${formatMoney(fs.amount, currencyCode)}`,
        }))}
      />
      <div className="space-y-1">
        <Label htmlFor={`receipt-${id}`} className="text-xs">
          {t("paperReceiptNumber")}
        </Label>
        <Input
          id={`receipt-${id}`}
          value={receiptRef}
          onChange={(e) => setReceiptRef(e.target.value)}
          placeholder={t("paperReceiptNumberPlaceholder")}
          className="h-8 text-xs"
        />
      </div>
      {classIsFull && canOverrideCapacity && (
        <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
          <input
            type="checkbox"
            checked={overrideCapacity}
            onChange={(e) => setOverrideCapacity(e.target.checked)}
          />
          {t("enrollAnywayFullClass")}
        </label>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={approve} disabled={loading}>
          {t("approve")}
        </Button>
        <Button size="sm" variant="outline" onClick={reject} disabled={loading}>
          {t("reject")}
        </Button>
      </div>
    </div>
  );
}
