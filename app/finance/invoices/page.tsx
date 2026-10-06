import { Suspense } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getInvoices,
  getStudentsForBilling,
  getFeeStructures,
} from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { InvoiceForm } from "./invoice-form";
import { InvoiceFilters } from "./invoice-filters";
import { InvoicesTable } from "./invoices-table";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; edit?: string }>;
}) {
  const t = await getTranslations("finance");
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const schoolId = profile?.school_id ?? undefined;
  const isSuperAdmin = profile?.role === "super_admin";

  const canLoadSchoolData = Boolean(schoolId) || isSuperAdmin;

  const [invoices, students, feeStructures] = canLoadSchoolData
    ? await Promise.all([
        getInvoices({
          schoolId,
          status: params.status,
          search: params.search,
        }),
        getStudentsForBilling({
          schoolId,
          status: "active",
        }),
        getFeeStructures(schoolId ? { schoolId } : undefined),
      ])
    : [[], [], []];

  const editingInvoice = params.edit
    ? invoices.find((inv) => inv.id === params.edit) ?? null
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("invoicesTitle")}</h1>

      {!canLoadSchoolData ? (
        <p className="text-sm text-stone-500">{t("assignSchoolInvoices")}</p>
      ) : (
        <InvoiceForm
          students={students.map((s) => ({
            id: s.id,
            name: s.name,
            student_id: s.student_id,
            class_name: s.class_name,
          }))}
          feeStructures={feeStructures.map((f) => ({
            id: f.id,
            name: f.name,
            amount: f.amount,
            class_id: f.class_id,
            class_name: f.class_name,
            school_year: f.school_year,
          }))}
          invoice={
            editingInvoice
              ? {
                  id: editingInvoice.id,
                  student_uuid: editingInvoice.student_uuid,
                  fee_structure_id: editingInvoice.fee_structure_id,
                  amount: editingInvoice.amount,
                  due_date: editingInvoice.due_date,
                  description: editingInvoice.description,
                }
              : null
          }
        />
      )}

      <Suspense fallback={null}>
        <InvoiceFilters />
      </Suspense>

      {invoices.length === 0 ? (
        <EmptyState
          title={t("noInvoices")}
          description={t("noInvoicesDesc")}
        />
      ) : (
        <InvoicesTable rows={invoices} />
      )}
    </div>
  );
}
