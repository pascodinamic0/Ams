import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const currentProfile = await getCurrentProfile();
  const t = await getTranslations("nav");

  return (
    <AppShell
      localeLocked={Boolean(currentProfile?.school_id)}
      sidebar={<Sidebar role="parent" />}
      header={<span className="font-medium">{t("parent")}</span>}
      dashboardHref="/parent"
      role="parent"
    >
      {children}
    </AppShell>
  );
}
