import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getExpenseTotal, getFinanceKPIs, getPayrollTotals, getSchoolCurrencyForSchool } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/lib/currency";

export default async function FinanceDashboard() {
  const t = await getTranslations("finance");
  const profile = await getCurrentProfile();
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };
  const [kpis, payrollTotals, operatingExpenses, currency] = await Promise.all([
    getFinanceKPIs(scope),
    getPayrollTotals(scope),
    getExpenseTotal(scope),
    getSchoolCurrencyForSchool(profile?.school_id),
  ]);
  const formatCurrency = (value: number) => formatMoney(value, currency.code);
  const cashAvailable = kpis.collected - payrollTotals.paid - operatingExpenses;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>School Fees Collected</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(kpis.collected)}</p>
            <p className="text-sm text-stone-500">Total received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Outstanding School Fees</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(kpis.outstanding)}</p>
            <p className="text-sm text-stone-500">Unpaid balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payroll Required</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(payrollTotals.total)}</p>
            <p className="text-sm text-stone-500">Total payroll due</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payroll Paid</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(payrollTotals.paid)}</p>
            <p className="text-sm text-stone-500">Paid salaries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Operating Expenses</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(operatingExpenses)}</p>
            <p className="text-sm text-stone-500">Non-payroll expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Cash Available</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(cashAvailable)}</p>
            <p className="text-sm text-stone-500">Fees collected - payroll paid - operating expenses</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>{t("quickActions")}</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/finance/invoices"><Button size="sm">{t("createInvoice")}</Button></Link>
          <Link href="/finance/payments"><Button size="sm" variant="ghost">{t("recordPayment")}</Button></Link>
          <Link href="/finance/fee-structure"><Button size="sm" variant="ghost">{t("feeStructures")}</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}
