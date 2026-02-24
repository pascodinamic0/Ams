import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";

export default function AcademicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      sidebar={<Sidebar role="academic_admin" />}
      header={<span className="font-medium">Academic</span>}
      dashboardHref="/academic"
    >
      {children}
    </AppShell>
  );
}
