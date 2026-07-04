import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getTranslations } from "next-intl/server";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");

  return (
    <AppShell
      sidebar={<Sidebar role="teacher" />}
      header={<span className="font-medium">{t("teacher")}</span>}
      dashboardHref="/teacher"
      role="teacher"
    >
      {children}
    </AppShell>
  );
}
