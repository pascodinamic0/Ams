import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
  };

  return (
    <AppShell
      sidebar={<Sidebar role={role} />}
      header={<span className="font-medium">Messages</span>}
      dashboardHref={dashboardMap[role] ?? "/"}
    >
      {children}
    </AppShell>
  );
}
