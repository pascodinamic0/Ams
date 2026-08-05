"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { deletePayrollPeriod } from "@/lib/actions/payroll";
import { toast } from "@/lib/toast";

interface PayrollMonthActionsProps {
  month: number;
  year: number;
  schoolId?: string;
  branchId?: string;
  label: string;
}

export function PayrollMonthActions({
  month,
  year,
  schoolId,
  branchId,
  label,
}: PayrollMonthActionsProps) {
  const t = useTranslations("finance");
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    const result = await deletePayrollPeriod({ month, year, schoolId, branchId });
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : t("deletePayrollFailed"));
      return;
    }
    toast.success(t("payrollDeleted", { label }));
    router.refresh();
  }

  return (
    <>
      <Button variant="ghost" className="text-red-600" onClick={() => setConfirmOpen(true)}>
        {t("deletePayrollButton", { label })}
      </Button>
      <Dialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("deletePayrollConfirmTitle", { label })}
        description={t("deletePayrollConfirmDesc")}
        confirmLabel={t("deletePayrollMonth")}
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
