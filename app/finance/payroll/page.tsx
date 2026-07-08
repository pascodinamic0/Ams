import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { UserAvatar } from "@/components/layout/user-avatar";
import { getExpenseTotal, getFinanceKPIs, getPayroll, getPayrollMonths, getSchoolCurrencyForSchool } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/lib/currency";
import { PayrollGenerateForm } from "./payroll-form";
import { PayrollFilters } from "./payroll-filters";
import { PayrollRowActions } from "./payroll-row-actions";
import { PayrollMonthActions } from "./payroll-month-actions";

type PageProps = {
  searchParams: Promise<{
    month?: string;
    year?: string;
    status?: string;
    search?: string;
    position?: string;
    department?: string;
  }>;
};

export default async function PayrollPage({ searchParams }: PageProps) {
  const t = await getTranslations("finance");
  const profile = await getCurrentProfile();
  const params = await searchParams;
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };

  const [months, financeKpis, operatingExpenses, currency] = await Promise.all([
    getPayrollMonths(scope),
    getFinanceKPIs(scope),
    getExpenseTotal(scope),
    getSchoolCurrencyForSchool(profile?.school_id),
  ]);
  const formatCurrency = (value: number) => formatMoney(value, currency.code);
  const activeMonth = Number(params.month ?? months[0]?.month ?? new Date().getMonth() + 1);
  const activeYear = Number(params.year ?? months[0]?.year ?? new Date().getFullYear());
  const activeLabel = new Date(Date.UTC(activeYear, activeMonth - 1, 1)).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" }
  );

  const payroll = await getPayroll({
    ...scope,
    month: activeMonth,
    year: activeYear,
    status: params.status || undefined,
    search: params.search || undefined,
    position: params.position || undefined,
    department: params.department || undefined,
  });

  const totalEmployees = payroll.length;
  const paidEmployees = payroll.filter((row) => row.status === "paid").length;
  const pendingEmployees = totalEmployees - paidEmployees;
  const payrollRequired = payroll.reduce((sum, row) => sum + row.amount, 0);
  const payrollPaid = payroll
    .filter((row) => row.status === "paid")
    .reduce((sum, row) => sum + row.amount, 0);
  const remainingPayroll = payrollRequired - payrollPaid;
  const cashAvailable = financeKpis.collected - payrollPaid - operatingExpenses;
  const positions = [...new Set(payroll.map((row) => row.staff_position).filter(Boolean))] as string[];
  const departments = [
    ...new Set(payroll.map((row) => row.staff_department).filter(Boolean)),
  ] as string[];
  const monthsByYear = months.reduce<Record<number, { month: number; label: string }[]>>(
    (acc, item) => {
      if (!acc[item.year]) acc[item.year] = [];
      acc[item.year].push({ month: item.month, label: item.label });
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("payrollTitle")}</h1>

      <PayrollGenerateForm
        schoolId={scope.schoolId}
        branchId={scope.branchId}
        defaultMonth={activeMonth}
        defaultYear={activeYear}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total Employees</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalEmployees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Paid Employees</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{paidEmployees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending Employees</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingEmployees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Payroll Amount</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(payrollRequired)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Amount Paid</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(payrollPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Remaining Payroll</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(remainingPayroll)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>School Fees Collected</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(financeKpis.collected)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Outstanding School Fees</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(financeKpis.outstanding)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payroll Required</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(payrollRequired)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payroll Paid</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(payrollPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Operating Expenses</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(operatingExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Cash Available</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(cashAvailable)}</p>
          </CardContent>
        </Card>
      </div>

      <PayrollFilters positions={positions} departments={departments} />

      <div className="grid gap-4 lg:grid-cols-[240px,1fr]">
        <Card>
          <CardHeader><CardTitle>Payroll</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(monthsByYear)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([year, entries]) => (
                <div key={year}>
                  <p className="mb-1 text-sm font-semibold">{year}</p>
                  <div className="space-y-1">
                    {entries.map((item) => (
                      <Link
                        key={`${year}-${item.month}`}
                        href={`/finance/payroll?year=${year}&month=${item.month}`}
                        className={`block rounded px-2 py-1 text-sm ${
                          Number(year) === activeYear && item.month === activeMonth
                            ? "bg-stone-200 dark:bg-stone-800"
                            : "hover:bg-stone-100 dark:hover:bg-stone-900"
                        }`}
                      >
                        {item.label.split(" ")[0]}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{activeLabel}</h2>
            <PayrollMonthActions
              month={activeMonth}
              year={activeYear}
              schoolId={scope.schoolId}
              branchId={scope.branchId}
              label={activeLabel}
            />
          </div>

          {payroll.length === 0 ? (
            <EmptyState
              title={t("noPayroll")}
              description="No payroll records for this month yet."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y divide-stone-200 text-sm dark:divide-stone-800">
                <thead className="bg-stone-50 dark:bg-stone-900/60">
                  <tr>
                    <th className="px-3 py-2 text-left">Photo</th>
                    <th className="px-3 py-2 text-left">Full Name</th>
                    <th className="px-3 py-2 text-left">Position</th>
                    <th className="px-3 py-2 text-left">Monthly Salary</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Payment Date</th>
                    <th className="px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {payroll.map((row) => (
                    <tr key={row.id}>
                      <td className="px-3 py-2">
                        <UserAvatar name={row.staff_name} avatarUrl={row.staff_photo_url} size="sm" />
                      </td>
                      <td className="px-3 py-2">{row.staff_name}</td>
                      <td className="px-3 py-2">{row.staff_position ?? "Staff"}</td>
                      <td className="px-3 py-2">{formatCurrency(row.amount)}</td>
                      <td className="px-3 py-2">
                        {row.status === "paid" ? (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Paid</span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">Pending</span>
                        )}
                      </td>
                      <td className="px-3 py-2">{row.payment_date ?? "—"}</td>
                      <td className="px-3 py-2">
                        <PayrollRowActions row={row} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
