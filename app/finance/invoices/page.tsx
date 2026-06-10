import { Suspense } from "react";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getInvoices, getStudents, getFeeStructures } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { InvoiceForm } from "./invoice-form";
import { InvoiceFilters } from "./invoice-filters";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };

  const [invoices, students, feeStructures] = await Promise.all([
    getInvoices({
      ...scope,
      status: params.status,
      search: params.search,
    }),
    getStudents(scope),
    scope.branchId ? getFeeStructures(scope.branchId) : getFeeStructures(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Invoices</h1>
      <InvoiceForm
        students={students.map((s) => ({
          id: s.id,
          name: s.name,
          student_id: s.student_id,
        }))}
        feeStructures={feeStructures.map((f) => ({
          id: f.id,
          name: f.name,
          amount: f.amount,
        }))}
      />
      <Suspense fallback={null}>
        <InvoiceFilters />
      </Suspense>
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
            { id: "fee_structure_name", header: "Fee type", accessorKey: "fee_structure_name" },
            { id: "amount", header: "Amount", accessorKey: "amount", sortable: true },
            { id: "amount_paid", header: "Paid", accessorKey: "amount_paid" },
            { id: "balance", header: "Balance", accessorKey: "balance", sortable: true },
            { id: "due_date", header: "Due Date", accessorKey: "due_date", sortable: true },
            { id: "status", header: "Status", accessorKey: "status" },
          ]}
        />
      )}
    </div>
  );
}
