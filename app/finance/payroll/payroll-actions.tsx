"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { markPayrollPaid, deletePayroll } from "@/lib/actions/payroll";
import { toast } from "@/lib/toast";

export function PayrollActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  async function handleMarkPaid() {
    const result = await markPayrollPaid(id);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to mark as paid");
      return;
    }
    toast.success("Payroll marked as paid");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this payroll entry?")) return;
    const result = await deletePayroll(id);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to delete");
      return;
    }
    toast.success("Payroll entry deleted");
    router.refresh();
  }

  return (
    <div className="flex gap-1">
      {status === "pending" && (
        <Button variant="ghost" size="sm" onClick={handleMarkPaid}>
          Mark paid
        </Button>
      )}
      <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );
}
