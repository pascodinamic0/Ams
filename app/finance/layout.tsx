import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");
  const profile = await getCurrentProfile();
  const role = profile?.role ?? "finance_officer";

  return (
    <AppShell
      sidebar={<Sidebar role={role} />}
      header={<span className="font-medium">{t("finance")}</span>}
      dashboardHref="/finance"
      role={role}
    >
      {children}
    </AppShell>
  );
}
