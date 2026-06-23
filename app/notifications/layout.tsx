import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

export default async function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getTranslations("nav");

  let role = "teacher";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role) role = profile.role;
  }

  const dashboardMap: Record<string, string> = {
    super_admin: "/admin",
    academic_admin: "/academic",
    teacher: "/teacher",
    finance_officer: "/finance",
    parent: "/parent",
    student: "/student",
    operations_manager: "/operations",
  };

  return (
    <AppShell
      sidebar={<Sidebar role={role} />}
      header={<span className="font-medium">{t("notifications")}</span>}
      dashboardHref={dashboardMap[role] ?? "/"}
    >
      {children}
    </AppShell>
  );
}
