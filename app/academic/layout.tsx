import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { SchoolSetupGuideShell } from "@/components/onboarding/school-setup-guide-shell";

export default function AcademicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      sidebar={<Sidebar role="academic_admin" />}
      header={<span className="font-medium">Academic</span>}
      dashboardHref="/academic"
    >
      <div className="space-y-6">
        <SchoolSetupGuideShell />
        {children}
      </div>
    </AppShell>
  );
}
