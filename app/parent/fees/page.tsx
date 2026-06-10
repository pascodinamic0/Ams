import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/session";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getGuardianByAuthUserId, getInvoicesForGuardian } from "@/lib/db";

export default async function ParentFeesPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState
        title="Not signed in"
        description="Please log in to view fees and invoices"
      />
    );
  }

  const guardian = await getGuardianByAuthUserId(profile.id);

  if (!guardian) {
    return (
      <EmptyState
        title="No guardian profile"
        description="Your account is not linked to a guardian profile. Contact the school."
      />
    );
  }

  const invoices = await getInvoicesForGuardian(guardian.id);
  const tableData = invoices.map((row) => ({
    ...row,
    pay_action:
      Number(row.balance) > 0 ? (
        <Link href={`/parent/pay?invoice=${row.id}`}>
          <Button size="sm">Pay</Button>
        </Link>
      ) : (
        "—"
      ),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fees & Payments</h1>
        <p className="mt-1 text-sm text-slate-500">
          View invoices and payment status for your children.
        </p>
      </div>
      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices"
          description="There are no fee invoices for your linked students."
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "student_name", header: "Student", accessorKey: "student_name", sortable: true },
            { id: "fee_structure_name", header: "Fee type", accessorKey: "fee_structure_name" },
            { id: "amount", header: "Amount", accessorKey: "amount" },
            { id: "amount_paid", header: "Paid", accessorKey: "amount_paid" },
            { id: "balance", header: "Balance", accessorKey: "balance" },
            { id: "due_date", header: "Due date", accessorKey: "due_date", sortable: true },
            { id: "status", header: "Status", accessorKey: "status" },
            { id: "pay", header: "", accessorKey: "pay_action" },
          ]}
        />
      )}
    </div>
  );
}
