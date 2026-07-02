import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPayroll, getPayrollTotals, getStaff } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { PayrollCreateForm, PayrollGenerateForm } from "./payroll-form";
import { PayrollActions } from "./payroll-actions";

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function PayrollPage() {
  const t = await getTranslations("finance");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };

  const [payroll, totals, staff] = await Promise.all([
    getPayroll(scope),
    getPayrollTotals(scope),
    getStaff(scope),
  ]);

  const staffOptions = staff.map((s) => ({ id: s.id, name: s.name }));
  const tableData = payroll.map((row) => ({
    ...row,
    actions: (
      <PayrollActions id={row.id as string} status={row.status as string} />
    ),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("payrollTitle")}</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>{t("payrollPending")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totals.pending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("payrollPaid")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.paid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{tc("total")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totals.total)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">{t("generatePayroll")}</h2>
        <p className="text-sm text-stone-500">
          {t("generatePayrollDesc")}
        </p>
        <PayrollGenerateForm schoolId={scope.schoolId} branchId={scope.branchId} />
      </div>

      {staffOptions.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">{t("addPayrollEntry")}</h2>
          <PayrollCreateForm staff={staffOptions} />
        </div>
      ) : (
        <p className="text-sm text-stone-500">{t("addStaffHint")}</p>
      )}

      {payroll.length === 0 ? (
        <EmptyState
          title={t("noPayroll")}
          description={t("noPayrollDesc")}
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "staff_name", header: t("colStaff"), accessorKey: "staff_name", sortable: true },
            { id: "staff_role", header: t("colRole"), accessorKey: "staff_role" },
            { id: "period_start", header: t("colPeriodStart"), accessorKey: "period_start", sortable: true },
            { id: "period_end", header: t("colPeriodEnd"), accessorKey: "period_end", sortable: true },
            { id: "amount", header: tc("amount"), accessorKey: "amount", sortable: true },
            { id: "status", header: tc("status"), accessorKey: "status", sortable: true },
            { id: "branch_name", header: t("colBranch"), accessorKey: "branch_name" },
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
