import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPayroll, getPayrollTotals, getStaff } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { PayrollCreateForm, PayrollGenerateForm } from "./payroll-form";
import { PayrollActions } from "./payroll-actions";

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function PayrollPage() {
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
      <h1 className="text-2xl font-bold">Payroll</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totals.pending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Paid</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.paid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totals.total)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Generate payroll</h2>
        <p className="text-sm text-slate-500">
          Create pending payroll entries for all staff in this period (skips duplicates).
        </p>
        <PayrollGenerateForm schoolId={scope.schoolId} branchId={scope.branchId} />
      </div>

      {staffOptions.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Add payroll entry</h2>
          <PayrollCreateForm staff={staffOptions} />
        </div>
      ) : (
        <p className="text-sm text-slate-500">Add staff members in Operations to manage payroll.</p>
      )}

      {payroll.length === 0 ? (
        <EmptyState
          title="No payroll records yet"
          description="Generate payroll for a pay period or add individual entries"
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "staff_name", header: "Staff", accessorKey: "staff_name", sortable: true },
            { id: "staff_role", header: "Role", accessorKey: "staff_role" },
            { id: "period_start", header: "Period start", accessorKey: "period_start", sortable: true },
            { id: "period_end", header: "Period end", accessorKey: "period_end", sortable: true },
            { id: "amount", header: "Amount", accessorKey: "amount", sortable: true },
            { id: "status", header: "Status", accessorKey: "status", sortable: true },
            { id: "branch_name", header: "Branch", accessorKey: "branch_name" },
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
