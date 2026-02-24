import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      sidebar={<Sidebar role="super_admin" />}
      header={<span className="font-medium">Admin</span>}
      dashboardHref="/admin"
    >
      {children}
    </AppShell>
  );
}
