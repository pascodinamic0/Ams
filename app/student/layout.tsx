import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getTranslations } from "next-intl/server";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");

  return (
    <AppShell
      sidebar={<Sidebar role="student" />}
      header={<span className="font-medium">{t("student")}</span>}
      dashboardHref="/student"
      role="student"
    >
      {children}
    </AppShell>
  );
}
