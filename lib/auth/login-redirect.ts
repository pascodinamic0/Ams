import { canAccessPath, getDashboardForRole, normalizeRole } from "./rbac";

type SchoolStatus = "pending" | "approved" | "suspended" | null;

export function resolveLoginDestination(options: {
  role: string | null | undefined;
  schoolStatus: SchoolStatus;
  redirect?: string | null;
}): string {
  const { role, schoolStatus, redirect } = options;
  const normalizedRole = normalizeRole(role);

  if (schoolStatus === "pending" || schoolStatus === "suspended") {
    return "/pending";
  }

  const roleDashboard = getDashboardForRole(normalizedRole);

  if (!redirect) {
    return roleDashboard;
  }

  // Public school sites are not dashboards; always send users to their role home.
  if (redirect === "/schools" || redirect.startsWith("/schools/")) {
    return roleDashboard;
  }

  if (canAccessPath(normalizedRole, redirect)) {
    return redirect;
  }

  return roleDashboard;
}
