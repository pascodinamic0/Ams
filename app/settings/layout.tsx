import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getDashboardForRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getTranslations("nav");

  let role = "student";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role) role = profile.role;
  }

  return (
    <AppShell
      sidebar={<Sidebar role={role} />}
      header={<span className="font-medium">{t("settings")}</span>}
      dashboardHref={getDashboardForRole(role)}
      role={role}
    >
      {children}
    </AppShell>
  );
}
