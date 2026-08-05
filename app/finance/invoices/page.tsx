import { Suspense } from "react";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportButton } from "@/components/ui/export-button";
import { getInvoices, getStudents, getFeeStructures } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { InvoiceForm } from "./invoice-form";
import { InvoiceFilters } from "./invoice-filters";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const t = await getTranslations("finance");
  const tc = await getTranslations("common");
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

  const exportRows = invoices.map((row) => ({
    student_id: row.student_id ?? "",
    student_name: row.student_name ?? "",
    fee_type: row.fee_structure_name ?? "",
    amount: row.amount,
    amount_paid: row.amount_paid,
    balance: row.balance,
    due_date: row.due_date ?? "",
    status: row.status ?? "",
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("invoicesTitle")}</h1>
        {exportRows.length > 0 ? (
          <ExportButton
            data={exportRows}
            filename="invoices.csv"
            label={t("exportCsv")}
            columns={[
              { key: "student_id", label: t("colStudentId") },
              { key: "student_name", label: t("colStudent") },
              { key: "fee_type", label: t("colFeeType") },
              { key: "amount", label: tc("amount") },
              { key: "amount_paid", label: tc("paid") },
              { key: "balance", label: tc("balance") },
              { key: "due_date", label: t("colDueDate") },
              { key: "status", label: tc("status") },
            ]}
          />
        ) : null}
      </div>
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
          title={t("noInvoices")}
          description={t("noInvoicesDesc")}
        />
      ) : (
        <DataTable
          data={invoices}
          columns={[
            { id: "student_id", header: t("colStudentId"), accessorKey: "student_id", sortable: true },
            { id: "student_name", header: t("colStudent"), accessorKey: "student_name", sortable: true },
            { id: "fee_structure_name", header: t("colFeeType"), accessorKey: "fee_structure_name" },
            { id: "amount", header: tc("amount"), accessorKey: "amount", sortable: true },
            { id: "amount_paid", header: tc("paid"), accessorKey: "amount_paid" },
            { id: "balance", header: tc("balance"), accessorKey: "balance", sortable: true },
            { id: "due_date", header: t("colDueDate"), accessorKey: "due_date", sortable: true },
            { id: "status", header: tc("status"), accessorKey: "status" },
          ]}
        />
      )}
    </div>
  );
}
