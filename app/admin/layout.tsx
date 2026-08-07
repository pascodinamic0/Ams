import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentProfile = await getCurrentProfile();
  const t = await getTranslations("nav");

  return (
    <AppShell
      localeLocked={Boolean(currentProfile?.school_id)}
      sidebar={<Sidebar role="super_admin" />}
      header={<span className="font-medium">{t("admin")}</span>}
      dashboardHref="/admin"
      role="super_admin"
    >
      {children}
    </AppShell>
  );
}
