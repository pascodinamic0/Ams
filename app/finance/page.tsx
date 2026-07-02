import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFinanceKPIs } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function FinanceDashboard() {
  const t = await getTranslations("finance");
  const profile = await getCurrentProfile();
  const kpis = await getFinanceKPIs({
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>{t("outstanding")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(kpis.outstanding)}</p>
            <p className="text-sm text-stone-500">{t("outstandingSub")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("collected")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(kpis.collected)}</p>
            <p className="text-sm text-stone-500">{t("collectedSub")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("overdue")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(kpis.overdue)}</p>
            <p className="text-sm text-stone-500">{t("overdueSub")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("invoicesKpi")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.invoiceCount}</p>
            <p className="text-sm text-stone-500">{t("invoicesSub")}</p>
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
