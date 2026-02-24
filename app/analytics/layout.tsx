import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell sidebar={<Sidebar role="analytics" />} header={<span className="font-medium">Analytics</span>} dashboardHref="/analytics">
      {children}
    </AppShell>
  );
}
