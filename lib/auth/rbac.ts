export type UserRole =
  | "super_admin"
  | "academic_admin"
  | "admin_coordinator"
  | "registrar"
  | "admissions_officer"
  | "pedagogy_coordinator"
  | "principal"
  | "teacher"
  | "finance_officer"
  | "cashier"
  | "accountant"
  | "operations_manager"
  | "operations_officer"
  | "discipline_officer"
  | "supervisor"
  | "pedagogical_council_member"
  | "parent"
  | "student"
  | "analytics";

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  super_admin: "/admin",
  academic_admin: "/academic",
  admin_coordinator: "/academic",
  registrar: "/academic",
  admissions_officer: "/academic",
  pedagogy_coordinator: "/academic",
  principal: "/academic",
  teacher: "/teacher",
  finance_officer: "/finance",
  cashier: "/finance",
  accountant: "/finance",
  operations_manager: "/operations",
  operations_officer: "/operations",
  discipline_officer: "/academic",
  supervisor: "/academic",
  pedagogical_council_member: "/academic",
  parent: "/parent",
  student: "/student",
  analytics: "/analytics",
};

type RouteScope = {
  path: string;
  exact?: boolean;
};

function exact(path: string): RouteScope {
  return { path, exact: true };
}

function tree(path: string): RouteScope {
  return { path };
}

export const ACADEMIC_PORTAL_ROLES: UserRole[] = [
  "academic_admin",
  "admin_coordinator",
  "registrar",
  "admissions_officer",
  "pedagogy_coordinator",
  "principal",
  "discipline_officer",
  "supervisor",
  "pedagogical_council_member",
];

export const FINANCE_PORTAL_ROLES: UserRole[] = [
  "finance_officer",
  "cashier",
  "accountant",
];

export const OPERATIONS_PORTAL_ROLES: UserRole[] = [
  "operations_manager",
  "operations_officer",
];

/** School staff who can use the unified /messages chat (staff↔staff and staff↔parent). */
export const MESSAGING_STAFF_ROLES: UserRole[] = [
  "super_admin",
  "academic_admin",
  "admin_coordinator",
  "registrar",
  "admissions_officer",
  "pedagogy_coordinator",
  "principal",
  "teacher",
  "finance_officer",
  "cashier",
  "accountant",
  "operations_manager",
  "operations_officer",
  "discipline_officer",
  "supervisor",
  "pedagogical_council_member",
  "analytics",
];

/** Discipline desk is limited to teacher-level accounts. */
export const DISCIPLINE_ROLES: UserRole[] = [
  "teacher",
  "discipline_officer",
  "supervisor",
];

/** School admin roles that appear on finance payroll for pay-amount setup. */
export const PAYROLL_ADMIN_ROLES: UserRole[] = [
  "academic_admin",
  "admin_coordinator",
  "registrar",
  "admissions_officer",
  "pedagogy_coordinator",
  "principal",
  "finance_officer",
  "accountant",
  "operations_manager",
  "operations_officer",
  "discipline_officer",
  "supervisor",
  "pedagogical_council_member",
];

/** Route scopes each role may access. Shared routes are listed separately. */
export const ROLE_ROUTE_SCOPES: Record<UserRole, RouteScope[]> = {
  super_admin: [tree("/admin"), tree("/analytics")],
  academic_admin: [tree("/academic"), tree("/analytics")],
  admin_coordinator: [
    exact("/academic"),
    tree("/academic/students"),
    tree("/academic/admissions"),
    tree("/academic/tasks"),
    tree("/outreach"),
  ],
  registrar: [
    exact("/academic"),
    tree("/academic/students"),
    tree("/academic/guardians"),
    tree("/academic/admissions"),
    tree("/academic/tasks"),
  ],
  admissions_officer: [
    exact("/academic"),
    tree("/academic/admissions"),
    tree("/academic/students"),
    tree("/academic/tasks"),
  ],
  pedagogy_coordinator: [
    exact("/academic"),
    tree("/academic/students"),
    tree("/academic/classes"),
    tree("/academic/sections"),
    tree("/academic/subjects"),
    tree("/academic/timetable"),
    tree("/academic/curriculum"),
    tree("/academic/tasks"),
    tree("/analytics"),
  ],
  principal: [tree("/academic"), tree("/analytics")],
  teacher: [tree("/teacher")],
  finance_officer: [tree("/finance")],
  cashier: [
    exact("/finance"),
    tree("/finance/invoices"),
    tree("/finance/outstanding"),
    tree("/finance/payments"),
  ],
  accountant: [tree("/finance")],
  operations_manager: [tree("/operations")],
  operations_officer: [tree("/operations")],
  discipline_officer: [
    exact("/academic"),
    tree("/academic/students"),
    tree("/academic/discipline"),
    tree("/analytics/attendance"),
  ],
  supervisor: [
    exact("/academic"),
    tree("/academic/students"),
    tree("/academic/timetable"),
    tree("/academic/discipline"),
    tree("/analytics/attendance"),
  ],
  pedagogical_council_member: [
    exact("/academic"),
    tree("/academic/curriculum"),
    tree("/academic/timetable"),
    tree("/analytics"),
  ],
  parent: [tree("/parent")],
  student: [tree("/student")],
  analytics: [tree("/analytics")],
};

/** Routes any authenticated user may visit regardless of role. */
export const SHARED_AUTH_ROUTES = [
  "/messages",
  "/notifications",
  "/settings",
  "/outreach",
  "/register/complete",
  "/onboarding",
  "/pending",
  "/billing",
  "/reset-password",
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

  // Expense receipts: finance roles + academic task approvers
  if (
    /^\/finance\/expenses\/[^/]+\/receipt\/?$/.test(pathname)
  ) {
    if (
      FINANCE_PORTAL_ROLES.includes(normalized) ||
      normalized === "academic_admin" ||
      normalized === "principal" ||
      normalized === "admin_coordinator" ||
      normalized === "registrar" ||
      normalized === "admissions_officer" ||
      normalized === "pedagogy_coordinator"
    ) {
      return true;
    }
  }

  // Super admin can access everything
  if (normalized === "super_admin") return true;

  // School team roster is academic-admin only (even if role has tree("/academic"))
  if (
    pathname === "/academic/team" ||
    pathname.startsWith("/academic/team/")
  ) {
    return normalized === "academic_admin";
  }

  // Discipline is teacher-level only (not academic admin / principal / coordinator)
  if (
    pathname === "/teacher/discipline" ||
    pathname.startsWith("/teacher/discipline/")
  ) {
    return normalized === "teacher";
  }
  if (
    pathname === "/academic/discipline" ||
    pathname.startsWith("/academic/discipline/")
  ) {
    return DISCIPLINE_ROLES.includes(normalized);
  }

  const allowed = ROLE_ROUTE_SCOPES[normalized];
  return allowed.some((scope) =>
    scope.exact
      ? pathname === scope.path
      : pathname === scope.path || pathname.startsWith(`${scope.path}/`)
  );
}
