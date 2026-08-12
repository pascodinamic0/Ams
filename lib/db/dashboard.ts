import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

export async function getAdminDashboardData() {
  const t = await getTranslations("analytics");
  const tc = await getTranslations("common");
  const tr = await getTranslations("roles");
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
    name: tr.has(name) ? tr(name) : name.replace(/_/g, " "),
    value,
  }));
  if (usersByRole.length === 0) {
    usersByRole.push({ name: t("noData"), value: 0 });
  }

  // Schools by status (public_site_enabled = active/inactive)
  const { data: schools } = await supabase
    .from("schools")
    .select("public_site_enabled");
  const statusCounts: Record<string, number> = { [tc("active")]: 0, [tc("inactive")]: 0 };
  for (const s of schools ?? []) {
    const status = s.public_site_enabled ? tc("active") : tc("inactive");
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

export async function getAcademicDashboardData(schoolId?: string) {
  const supabase = await createClient();

  let studentsQuery = supabase.from("students").select("id, status", { count: "exact" });
  let admissionsQuery = supabase
    .from("admission_applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  let classesQuery = supabase.from("classes").select("id", { count: "exact", head: true });

  if (schoolId) {
    studentsQuery = studentsQuery.eq("school_id", schoolId);
    admissionsQuery = admissionsQuery.eq("school_id", schoolId);
  }

  const [studentsResult, admissionsResult, classesResult] = await Promise.all([
    studentsQuery,
    admissionsQuery,
    classesQuery,
  ]);

  const students = studentsResult.data ?? [];
  const activeStudents = students.filter((s) => s.status === "active").length;

  return {
    totalStudents: studentsResult.count ?? students.length,
    activeStudents,
    pendingAdmissions: admissionsResult.count ?? 0,
    classes: classesResult.count ?? 0,
  };
}

export type OperationsKPIs = {
  libraryTitles: number;
  booksOnLoan: number;
  overdueLoans: number;
  staffCount: number;
  transportRoutes: number;
  upcomingEvents: number;
};

export async function getOperationsDashboardData(options?: {
  schoolId?: string;
  branchId?: string;
}): Promise<OperationsKPIs> {
  const { getLibraryStats } = await import("./library");
  const { getTransportStats } = await import("./transport");
  const { getUpcomingEventsCount } = await import("./events");
  const { getStaffCount } = await import("./staff");

  const scope = {
    schoolId: options?.schoolId,
    branchId: options?.branchId,
  };

  const [library, transport, upcomingEvents, staffCount] = await Promise.all([
    getLibraryStats(scope),
    getTransportStats(scope),
    getUpcomingEventsCount(scope),
    getStaffCount(scope),
  ]);

  return {
    libraryTitles: library.titles,
    booksOnLoan: library.activeIssues,
    overdueLoans: library.overdueIssues,
    staffCount,
    transportRoutes: transport.routes,
    upcomingEvents,
  };
}
