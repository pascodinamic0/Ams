import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFinanceKPIs } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function FinanceDashboard() {
  const profile = await getCurrentProfile();
  const kpis = await getFinanceKPIs({
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Finance Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Outstanding</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(kpis.outstanding)}</p>
            <p className="text-sm text-slate-500">Unpaid balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Collected</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(kpis.collected)}</p>
            <p className="text-sm text-slate-500">Total received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Overdue</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(kpis.overdue)}</p>
            <p className="text-sm text-slate-500">Past due balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.invoiceCount}</p>
            <p className="text-sm text-slate-500">All time</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/finance/invoices"><Button size="sm">Create invoice</Button></Link>
          <Link href="/finance/payments"><Button size="sm" variant="ghost">Record payment</Button></Link>
          <Link href="/finance/fee-structure"><Button size="sm" variant="ghost">Fee structures</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}
