import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SchoolSetupGuideShell } from "@/components/onboarding/school-setup-guide-shell";
import { getCurrentProfile } from "@/lib/auth/session";
import { getDailyReportsEnabledForSchool } from "@/lib/db/schools";
import { getTranslations } from "next-intl/server";

export default async function AcademicLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");
  const profile = await getCurrentProfile();
  const role = profile?.role ?? "academic_admin";
  const dailyReportsEnabled = profile?.school_id
    ? await getDailyReportsEnabledForSchool(profile.school_id)
    : true;

  return (
    <AppShell
      localeLocked={Boolean(profile?.school_id)}
      sidebar={<Sidebar role={role} dailyReportsEnabled={dailyReportsEnabled} />}
      header={<span className="font-medium">{t("academic")}</span>}
      dashboardHref="/academic"
      role={role}
    >
      <div className="space-y-6">
        <SchoolSetupGuideShell />
        {children}
      </div>
    </AppShell>
  );
}
