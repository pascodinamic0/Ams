import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function OutreachLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
      header={<span className="font-medium">Outreach</span>}
      dashboardHref={dashboardHref}
    >
      {children}
    </AppShell>
  );
}
