import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SchoolSetupGuideShell } from "@/components/onboarding/school-setup-guide-shell";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export default async function AcademicLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");
  const profile = await getCurrentProfile();
  const role = profile?.role ?? "academic_admin";

  return (
    <AppShell
      sidebar={<Sidebar role={role} />}
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
