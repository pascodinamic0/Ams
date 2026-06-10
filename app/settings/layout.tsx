import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { getDashboardForRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      header={<span className="font-medium">Settings</span>}
      dashboardHref={getDashboardForRole(role)}
    >
      {children}
    </AppShell>
  );
}
