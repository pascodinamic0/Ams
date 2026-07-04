import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SchoolSetupGuideShell } from "@/components/onboarding/school-setup-guide-shell";
import { getTranslations } from "next-intl/server";

export default async function AcademicLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");

  return (
    <AppShell
      sidebar={<Sidebar role="academic_admin" />}
      header={<span className="font-medium">{t("academic")}</span>}
      dashboardHref="/academic"
      role="academic_admin"
    >
      <div className="space-y-6">
        <SchoolSetupGuideShell />
        {children}
      </div>
    </AppShell>
  );
}
