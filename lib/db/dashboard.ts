import { createClient } from "@/lib/supabase/server";

export async function getAdminDashboardData() {
  const supabase = await createClient();

  const [schoolsResult, profilesResult, studentsResult] = await Promise.all([
    supabase.from("schools").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id, role"),
    supabase.from("students").select("id", { count: "exact", head: true }),
  ]);

  const schoolsCount = schoolsResult.count ?? 0;
  const studentsCount = studentsResult.count ?? 0;
  const profiles = profilesResult.data ?? [];
  const usersCount = profiles.length;

  // Aggregate users by role
  const roleCounts: Record<string, number> = {};
  for (const p of profiles) {
    const role = (p.role as string) ?? "student";
    roleCounts[role] = (roleCounts[role] ?? 0) + 1;
  }
  const usersByRole = Object.entries(roleCounts).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value,
  }));
  if (usersByRole.length === 0) {
    usersByRole.push({ name: "No data", value: 0 });
  }

  // Schools by status (public_site_enabled = active/inactive)
  const { data: schools } = await supabase
    .from("schools")
    .select("public_site_enabled");
  const statusCounts: Record<string, number> = { Active: 0, Inactive: 0 };
  for (const s of schools ?? []) {
    const status = s.public_site_enabled ? "Active" : "Inactive";
    statusCounts[status]++;
  }
  const schoolsByStatus = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    schools: schoolsCount,
    users: usersCount,
    students: studentsCount,
    usersByRole,
    schoolsByStatus,
  };
}
