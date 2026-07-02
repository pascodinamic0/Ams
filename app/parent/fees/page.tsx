import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/session";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getGuardianByAuthUserId, getInvoicesForGuardian } from "@/lib/db";
import { getTranslations } from "next-intl/server";

export default async function ParentFeesPage() {
  const t = await getTranslations("parent");
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState
        title={t("notSignedIn")}
        description={t("notSignedInDescFees")}
      />
    );
  }

  const guardian = await getGuardianByAuthUserId(profile.id);

  if (!guardian) {
    return (
      <EmptyState
        title={t("noGuardianProfile")}
        description={t("noGuardianProfileDesc")}
      />
    );
  }

  const invoices = await getInvoicesForGuardian(guardian.id);
  const tableData = invoices.map((row) => ({
    ...row,
    pay_action:
      Number(row.balance) > 0 ? (
        <Link href={`/parent/pay?invoice=${row.id}`}>
          <Button size="sm">{t("pay")}</Button>
        </Link>
      ) : (
        "—"
      ),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("feesPageTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("feesPageSubtitle")}</p>
      </div>
      {invoices.length === 0 ? (
        <EmptyState
          title={t("noInvoices")}
          description={t("noInvoicesDesc")}
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "student_name", header: t("colStudent"), accessorKey: "student_name", sortable: true },
            { id: "fee_structure_name", header: t("colFeeType"), accessorKey: "fee_structure_name" },
            { id: "amount", header: t("colAmount"), accessorKey: "amount" },
            { id: "amount_paid", header: t("colPaid"), accessorKey: "amount_paid" },
            { id: "balance", header: t("colBalance"), accessorKey: "balance" },
            { id: "due_date", header: t("colDueDate"), accessorKey: "due_date", sortable: true },
            { id: "status", header: t("colStatus"), accessorKey: "status" },
            { id: "pay", header: "", accessorKey: "pay_action" },
          ]}
        />
      )}
    </div>
  );
}
