import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell sidebar={<Sidebar role="student" />} header={<span className="font-medium">Student</span>} dashboardHref="/student">
      {children}
    </AppShell>
  );
}
