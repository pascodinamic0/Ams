import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getTranslations } from "next-intl/server";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const currentProfile = await getCurrentProfile();
  const t = await getTranslations("nav");

  return (
    <AppShell
      localeLocked={Boolean(currentProfile?.school_id)}
      sidebar={<Sidebar role="teacher" />}
      header={<span className="font-medium">{t("teacher")}</span>}
      dashboardHref="/teacher"
      role="teacher"
    >
      {children}
    </AppShell>
  );
}
