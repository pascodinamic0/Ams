import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export default async function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");
  const profile = await getCurrentProfile();
  const role = profile?.role ?? "analytics";

  return (
    <AppShell
      localeLocked={Boolean(profile?.school_id)}
      sidebar={<Sidebar role={role} />}
      header={<span className="font-medium">{t("analytics")}</span>}
      dashboardHref="/analytics"
      role={role}
    >
      {children}
    </AppShell>
  );
}
