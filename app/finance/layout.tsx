import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getTranslations } from "next-intl/server";

export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");

  return (
    <AppShell
      sidebar={<Sidebar role="finance_officer" />}
      header={<span className="font-medium">{t("finance")}</span>}
      dashboardHref="/finance"
      role="finance_officer"
    >
      {children}
    </AppShell>
  );
}
