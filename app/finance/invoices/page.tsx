import { Suspense } from "react";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportButton } from "@/components/ui/export-button";
import { getClasses, getInvoices, getStudents, getFeeStructures } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { BulkInvoiceForm } from "./bulk-invoice-form";
import { InvoiceForm } from "./invoice-form";
import { InvoiceFilters } from "./invoice-filters";
import { InvoicePrintButton } from "./invoice-print-button";

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

  const [invoices, students, feeStructures, classes] = await Promise.all([
    getInvoices({
      ...scope,
      status: params.status,
      search: params.search,
    }),
    getStudents(scope),
    scope.branchId ? getFeeStructures(scope.branchId) : getFeeStructures(),
    getClasses(scope.branchId),
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
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h1 className="text-2xl font-bold">{t("invoicesTitle")}</h1>
        <div className="flex flex-wrap items-center gap-2">
          {exportRows.length > 0 ? (
            <>
              <InvoicePrintButton label={t("printInvoices")} />
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
            </>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 print:hidden">
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
        <BulkInvoiceForm
          feeStructures={feeStructures.map((f) => ({
            id: f.id,
            name: f.name,
            amount: f.amount,
            class_id: f.class_id,
          }))}
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>

      <div className="print:hidden">
        <Suspense fallback={null}>
          <InvoiceFilters />
        </Suspense>
      </div>

      {invoices.length === 0 ? (
        <div className="print:hidden">
          <EmptyState
            title={t("noInvoices")}
            description={t("noInvoicesDesc")}
          />
        </div>
      ) : (
        <>
          <div className="print:hidden">
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
          </div>

          <div className="hidden print:block">
            <h1 className="mb-4 text-xl font-bold">{t("invoicePrintTitle")}</h1>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-3">{t("colStudentId")}</th>
                  <th className="py-2 pr-3">{t("colStudent")}</th>
                  <th className="py-2 pr-3">{t("colFeeType")}</th>
                  <th className="py-2 pr-3">{tc("amount")}</th>
                  <th className="py-2 pr-3">{tc("paid")}</th>
                  <th className="py-2 pr-3">{tc("balance")}</th>
                  <th className="py-2 pr-3">{t("colDueDate")}</th>
                  <th className="py-2">{tc("status")}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((row) => (
                  <tr key={row.id} className="border-b border-stone-200">
                    <td className="py-2 pr-3">{row.student_id ?? ""}</td>
                    <td className="py-2 pr-3">{row.student_name ?? ""}</td>
                    <td className="py-2 pr-3">{row.fee_structure_name ?? ""}</td>
                    <td className="py-2 pr-3">{row.amount}</td>
                    <td className="py-2 pr-3">{row.amount_paid}</td>
                    <td className="py-2 pr-3">{row.balance}</td>
                    <td className="py-2 pr-3">{row.due_date ?? ""}</td>
                    <td className="py-2">{row.status ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
