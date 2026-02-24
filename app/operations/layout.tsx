import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell sidebar={<Sidebar role="operations_manager" />} header={<span className="font-medium">Operations</span>} dashboardHref="/operations">
      {children}
    </AppShell>
  );
}
