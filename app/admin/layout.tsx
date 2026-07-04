import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getTranslations } from "next-intl/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("nav");

  return (
    <AppShell
      sidebar={<Sidebar role="super_admin" />}
      header={<span className="font-medium">{t("admin")}</span>}
      dashboardHref="/admin"
      role="super_admin"
    >
      {children}
    </AppShell>
  );
}
