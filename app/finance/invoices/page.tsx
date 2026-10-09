import { Suspense } from "react";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getInvoices,
  getStudentsForBilling,
  getFeeStructures,
  getSchoolById,
  getSchoolCurrencyForSchool,
} from "@/lib/db";
import type { InvoiceListItem } from "@/lib/db/invoices";
import { getCurrentProfile } from "@/lib/auth/session";
import { formatMoney } from "@/lib/currency";
import { getTranslations } from "next-intl/server";
import { InvoiceForm } from "./invoice-form";
import { InvoiceFilters } from "./invoice-filters";
import { InvoiceDueCalendar } from "./invoice-due-calendar";
import { InvoicesTable } from "./invoices-table";

const STATUSES = new Set(["unpaid", "all", "paid", "overdue"]);

function isOverdue(inv: InvoiceListItem) {
  if (inv.status === "paid") return false;
  if (inv.status === "overdue") return true;
  return new Date(inv.due_date) < new Date(new Date().toDateString());
}

function matchesStatus(inv: InvoiceListItem, status: string) {
  if (status === "all") return true;
  if (status === "paid") return inv.status === "paid";
  if (status === "overdue") return isOverdue(inv);
  return inv.balance > 0 && inv.status !== "paid";
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    search?: string;
    class?: string;
    edit?: string;
  }>;
}) {
  const t = await getTranslations("finance");
  const tc = await getTranslations("common");
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const schoolId = profile?.school_id ?? undefined;
  const isSuperAdmin = profile?.role === "super_admin";
  const canLoadSchoolData = Boolean(schoolId) || isSuperAdmin;
  const status = STATUSES.has(params.status ?? "") ? params.status! : "unpaid";
  const search = params.search?.trim().toLowerCase() ?? "";
  const className = params.class ?? "";

  const [invoices, students, feeStructures, currency, school] = canLoadSchoolData
    ? await Promise.all([
        getInvoices({
          schoolId,
          branchId: profile?.branch_id ?? undefined,
        }),
        getStudentsForBilling({
          schoolId,
          recognized: true,
        }),
        getFeeStructures(schoolId ? { schoolId } : undefined),
        getSchoolCurrencyForSchool(schoolId),
        schoolId ? getSchoolById(schoolId) : Promise.resolve(null),
      ])
    : [[], [], [], { code: "USD" }, null];

  const classOptions = Array.from(
    new Set(
      invoices
        .map((inv) => inv.class_name)
        .filter((name): name is string => Boolean(name))
    )
  ).sort((a, b) => a.localeCompare(b));

  const filtered = invoices.filter((inv) => {
    if (className && inv.class_name !== className) return false;
    if (!matchesStatus(inv, status)) return false;
    if (!search) return true;
    return (
      inv.student_name.toLowerCase().includes(search) ||
      inv.student_id.toLowerCase().includes(search) ||
      (inv.class_name?.toLowerCase().includes(search) ?? false)
    );
  });

  const debtView = status === "unpaid" || status === "overdue";
  const studentsWithDebt = new Set(
    filtered.map((inv) => inv.student_uuid || inv.student_id || inv.id)
  ).size;
  const totalOwed = filtered.reduce((sum, inv) => sum + inv.balance, 0);
  const money = (value: number) => formatMoney(value, currency.code);

  const editingInvoice = params.edit
    ? invoices.find((inv) => inv.id === params.edit) ?? null
    : null;

  const openCount = invoices.filter((inv) => matchesStatus(inv, "unpaid")).length;
  const emptyTitle =
    invoices.length === 0
      ? t("noInvoices")
      : debtView && openCount === 0
        ? t("noOutstanding")
        : tc("noResults");
  const emptyDescription =
    invoices.length === 0
      ? t("noInvoicesDesc")
      : debtView && openCount === 0
        ? t("noOutstandingDesc")
        : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("invoicesTitle")}</h1>
        <p className="mt-1 max-w-2xl text-sm text-stone-500">
          {t("outstandingSubtitle")}
        </p>
      </div>

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

      {canLoadSchoolData && debtView ? (
        <section className="grid gap-3 sm:grid-cols-3 print:hidden">
          <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              {t("studentsWithDebt")}
            </p>
            <p className="mt-1 text-2xl font-bold">{studentsWithDebt}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              {t("openInvoicesCount")}
            </p>
            <p className="mt-1 text-2xl font-bold">{filtered.length}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              {t("totalOwed")}
            </p>
            <p className="mt-1 text-2xl font-bold">{money(totalOwed)}</p>
          </div>
        </section>
      ) : null}

      {canLoadSchoolData ? (
        <InvoiceDueCalendar
          currencyCode={currency.code}
          invoices={invoices
            .filter((inv) => inv.balance > 0 && inv.status !== "paid")
            .map((inv) => ({
              id: inv.id,
              studentName: inv.student_name,
              studentId: inv.student_id,
              className: inv.class_name,
              dueDate: inv.due_date,
              balance: inv.balance,
            }))}
        />
      ) : null}

      <Suspense fallback={null}>
        <InvoiceFilters classOptions={classOptions} />
      </Suspense>

      {filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <InvoicesTable
          rows={filtered}
          school={
            school
              ? {
                  name: school.name,
                  logo_url: school.logo_url,
                  address: school.address,
                }
              : null
          }
          currencyCode={currency.code}
          issuedOn={format(new Date(), "yyyy-MM-dd")}
        />
      )}
    </div>
  );
}
