import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

export default async function OutreachLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations("nav");

  let role = "academic_admin";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role) role = profile.role;
  }

  const dashboardHref = role === "super_admin" ? "/admin" : "/academic";

  return (
    <AppShell
      sidebar={<Sidebar role={role} />}
      header={<span className="font-medium">{t("outreach")}</span>}
      dashboardHref={dashboardHref}
    >
      {children}
    </AppShell>
  );
}
