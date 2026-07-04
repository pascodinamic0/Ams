import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getTranslations } from "next-intl/server";

export default async function OperationsLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");

  return (
    <AppShell
      sidebar={<Sidebar role="operations_manager" />}
      header={<span className="font-medium">{t("operations")}</span>}
      dashboardHref="/operations"
      role="operations_manager"
    >
      {children}
    </AppShell>
  );
}
