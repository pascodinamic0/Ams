import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell sidebar={<Sidebar role="finance_officer" />} header={<span className="font-medium">Finance</span>} dashboardHref="/finance">
      {children}
    </AppShell>
  );
}
