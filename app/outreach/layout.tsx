import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getDashboardForRole } from "@/lib/auth/rbac";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export default async function OutreachLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");
  const profile = await getCurrentProfile();
  const role = profile?.role ?? "academic_admin";

  return (
    <AppShell
      sidebar={<Sidebar role={role} />}
      header={<span className="font-medium">{t("outreach")}</span>}
      dashboardHref={getDashboardForRole(role)}
      role={role}
    >
      {children}
    </AppShell>
  );
}
