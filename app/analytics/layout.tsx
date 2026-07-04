import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getTranslations } from "next-intl/server";

export default async function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");

  return (
    <AppShell
      sidebar={<Sidebar role="analytics" />}
      header={<span className="font-medium">{t("analytics")}</span>}
      dashboardHref="/analytics"
      role="analytics"
    >
      {children}
    </AppShell>
  );
}
