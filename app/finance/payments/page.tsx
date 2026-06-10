import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getPayments, getOpenInvoices } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { PaymentForm } from "./payment-form";

export default async function PaymentsPage() {
  const profile = await getCurrentProfile();
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };

  const [payments, openInvoices] = await Promise.all([
    getPayments(scope),
    getOpenInvoices(scope),
  ]);

  const invoiceOptions = openInvoices.map((inv) => ({
    id: inv.id,
    balance: inv.balance,
    label: `${inv.student_name} (${inv.student_id}) - due ${inv.due_date}`,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>
      <PaymentForm openInvoices={invoiceOptions} />
      {payments.length === 0 ? (
        <EmptyState
          title="No payments yet"
          description="Record a manual payment against an open invoice"
        />
      ) : (
        <DataTable
          data={payments}
          columns={[
            { id: "paid_at", header: "Date", accessorKey: "paid_at", sortable: true },
            { id: "student_name", header: "Student", accessorKey: "student_name", sortable: true },
            { id: "amount", header: "Amount", accessorKey: "amount", sortable: true },
            { id: "method", header: "Method", accessorKey: "method" },
            { id: "reference", header: "Reference", accessorKey: "reference" },
            { id: "invoice_amount", header: "Invoice total", accessorKey: "invoice_amount" },
          ]}
        />
      )}
    </div>
  );
}
