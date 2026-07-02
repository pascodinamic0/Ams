import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getPayments, getOpenInvoices } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { PaymentForm } from "./payment-form";

export default async function PaymentsPage() {
  const t = await getTranslations("finance");
  const tc = await getTranslations("common");
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
      <h1 className="text-2xl font-bold">{t("paymentsTitle")}</h1>
      <PaymentForm openInvoices={invoiceOptions} />
      {payments.length === 0 ? (
        <EmptyState
          title={t("noPayments")}
          description={t("noPaymentsDesc")}
        />
      ) : (
        <DataTable
          data={payments}
          columns={[
            { id: "paid_at", header: tc("date"), accessorKey: "paid_at", sortable: true },
            { id: "student_name", header: t("colStudent"), accessorKey: "student_name", sortable: true },
            { id: "amount", header: tc("amount"), accessorKey: "amount", sortable: true },
            { id: "method", header: t("colMethod"), accessorKey: "method" },
            { id: "reference", header: t("colReference"), accessorKey: "reference" },
            { id: "invoice_amount", header: t("colInvoiceTotal"), accessorKey: "invoice_amount" },
          ]}
        />
      )}
    </div>
  );
}
