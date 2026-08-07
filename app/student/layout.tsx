import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const currentProfile = await getCurrentProfile();
  const t = await getTranslations("nav");

  return (
    <AppShell
      localeLocked={Boolean(currentProfile?.school_id)}
      sidebar={<Sidebar role="student" />}
      header={<span className="font-medium">{t("student")}</span>}
      dashboardHref="/student"
      role="student"
    >
      {children}
    </AppShell>
  );
}
