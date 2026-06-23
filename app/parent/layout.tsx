import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getTranslations } from "next-intl/server";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");

  return (
    <AppShell
      sidebar={<Sidebar role="parent" />}
      header={<span className="font-medium">{t("parent")}</span>}
      dashboardHref="/parent"
    >
      {children}
    </AppShell>
  );
}
