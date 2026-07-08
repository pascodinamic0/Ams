"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    const result = await deletePayrollPeriod({ month, year, schoolId, branchId });
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to delete payroll");
      return;
    }
    toast.success(`Deleted ${label} payroll`);
    router.refresh();
  }

  return (
    <>
      <Button variant="ghost" className="text-red-600" onClick={() => setConfirmOpen(true)}>
        Delete {label} Payroll
      </Button>
      <Dialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Delete ${label} payroll?`}
        description="This will remove every payroll record for the selected month."
        confirmLabel="Delete payroll month"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
