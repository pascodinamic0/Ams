import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell sidebar={<Sidebar role="teacher" />} header={<span className="font-medium">Teacher</span>} dashboardHref="/teacher">
      {children}
    </AppShell>
  );
}
