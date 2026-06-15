export type UserRole =
  | "super_admin"
  | "academic_admin"
  | "teacher"
  | "finance_officer"
  | "operations_manager"
  | "parent"
  | "student"
  | "analytics";

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  super_admin: "/admin",
  academic_admin: "/academic",
  teacher: "/teacher",
  finance_officer: "/finance",
  operations_manager: "/operations",
  parent: "/parent",
  student: "/student",
  analytics: "/analytics",
};

/** Path prefixes each role may access. Shared routes are listed separately. */
export const ROLE_PATH_PREFIXES: Record<UserRole, string[]> = {
  super_admin: ["/admin"],
  academic_admin: ["/academic"],
  teacher: ["/teacher"],
  finance_officer: ["/finance"],
  operations_manager: ["/operations"],
  parent: ["/parent"],
  student: ["/student"],
  analytics: ["/analytics"],
};

/** Routes any authenticated user may visit regardless of role. */
export const SHARED_AUTH_ROUTES = [
  "/messages",
  "/notifications",
  "/settings",
  "/outreach",
  "/register/complete",
  "/pending",
];

export function normalizeRole(role: string | null | undefined): UserRole {
  const normalized = role?.toLowerCase().replace(/\s/g, "_") ?? "student";
  if (normalized in ROLE_DASHBOARDS) {
    return normalized as UserRole;
  }
  return "student";
}

export function getDashboardForRole(role: string | null | undefined): string {
  return ROLE_DASHBOARDS[normalizeRole(role)];
}

export function canAccessPath(
  role: string | null | undefined,
  pathname: string
): boolean {
  const normalized = normalizeRole(role);

  if (
    (pathname === "/messages" || pathname.startsWith("/messages/")) &&
    normalized === "student"
  ) {
    return false;
  }

  if (SHARED_AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return true;
  }

  // Super admin can access everything
  if (normalized === "super_admin") return true;

  const allowed = ROLE_PATH_PREFIXES[normalized];
  return allowed.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
