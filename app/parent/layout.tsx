import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell sidebar={<Sidebar role="parent" />} header={<span className="font-medium">Parent</span>} dashboardHref="/parent">
      {children}
    </AppShell>
  );
}
