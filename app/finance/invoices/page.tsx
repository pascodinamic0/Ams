import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getInvoices } from "@/lib/db";

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Invoices</h1>
      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Create fee structures and generate invoices for students"
        />
      ) : (
        <DataTable
          data={invoices}
          columns={[
            { id: "student_id", header: "Student ID", accessorKey: "student_id", sortable: true },
            { id: "student_name", header: "Student", accessorKey: "student_name", sortable: true },
            { id: "amount", header: "Amount", accessorKey: "amount" },
            { id: "amount_paid", header: "Paid", accessorKey: "amount_paid" },
            { id: "due_date", header: "Due Date", accessorKey: "due_date", sortable: true },
            { id: "status", header: "Status", accessorKey: "status" },
          ]}
          keyExtractor={(row) => (row as { id: string }).id}
        />
      )}
    </div>
  );
}
