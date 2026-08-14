import { normalizeRole, type UserRole } from "@/lib/auth/rbac";

export type RoleQuickAction = {
  href: string;
  label: string;
  variant?: "primary" | "ghost" | "outline" | "secondary";
};

export type RoleWorkspace = {
  role: UserRole;
  title: string;
  subtitle: string;
  focusQuestion: string;
  quickActions: RoleQuickAction[];
  metricHints: string[];
};

type Translator = (key: string) => string;

type ActionSpec = {
  href: string;
  key: string;
  variant?: RoleQuickAction["variant"];
};

type WorkspaceSpec = {
  role: UserRole;
  metricHints: string[];
  actions: ActionSpec[];
};

const SPECS: Record<string, WorkspaceSpec> = {
  academic_admin: {
    role: "academic_admin",
    metricHints: ["students", "classes", "admissions", "openTasks"],
    actions: [
      { href: "/academic/team", key: "manageTeam" },
      { href: "/academic/settings", key: "schoolSettings", variant: "ghost" },
      { href: "/academic/students/new", key: "addStudent", variant: "ghost" },
      { href: "/academic/tasks", key: "openTaskBoard", variant: "outline" },
    ],
  },
  admin_coordinator: {
    role: "admin_coordinator",
    metricHints: ["openTasks", "overdueTasks", "admissions", "students"],
    actions: [
      { href: "/academic/tasks", key: "manageTasks" },
      { href: "/academic/admissions", key: "checkAdmissions", variant: "ghost" },
      { href: "/academic/students", key: "reviewStudents", variant: "ghost" },
      { href: "/outreach", key: "sendOutreach", variant: "outline" },
    ],
  },
  principal: {
    role: "principal",
    metricHints: ["admissions", "openTasks", "students"],
    actions: [
      { href: "/academic/tasks", key: "approvalsTasks" },
      { href: "/academic/admissions", key: "reviewAdmissions", variant: "ghost" },
      { href: "/analytics", key: "openReports", variant: "outline" },
    ],
  },
  registrar: {
    role: "registrar",
    metricHints: ["students", "admissions", "classes"],
    actions: [
      { href: "/academic/students/new", key: "addStudent" },
      { href: "/academic/students", key: "studentRegistry", variant: "ghost" },
      { href: "/academic/guardians", key: "guardians", variant: "ghost" },
      { href: "/academic/admissions", key: "admissionsIntake", variant: "outline" },
    ],
  },
  admissions_officer: {
    role: "admissions_officer",
    metricHints: ["admissions", "students", "openTasks"],
    actions: [
      { href: "/academic/admissions", key: "reviewApplications" },
      { href: "/academic/students/new", key: "createStudent", variant: "ghost" },
      { href: "/academic/tasks", key: "followUpTasks", variant: "outline" },
    ],
  },
  pedagogy_coordinator: {
    role: "pedagogy_coordinator",
    metricHints: ["classes", "students", "admissions"],
    actions: [
      { href: "/academic/timetable", key: "buildTimetable" },
      { href: "/academic/classes", key: "manageClasses", variant: "ghost" },
      { href: "/academic/subjects", key: "manageSubjects", variant: "ghost" },
      { href: "/analytics", key: "academicReports", variant: "outline" },
    ],
  },
  discipline_officer: {
    role: "discipline_officer",
    metricHints: ["openIncidents", "students", "admissions"],
    actions: [
      { href: "/academic/discipline", key: "openCases" },
      { href: "/academic/students", key: "findStudent", variant: "ghost" },
      { href: "/analytics/attendance", key: "attendancePatterns", variant: "outline" },
    ],
  },
  supervisor: {
    role: "supervisor",
    metricHints: ["openIncidents", "students", "classes"],
    actions: [
      { href: "/academic/discipline", key: "reportIncident" },
      { href: "/academic/timetable", key: "todaysTimetable", variant: "ghost" },
      { href: "/analytics/attendance", key: "attendance", variant: "outline" },
    ],
  },
  pedagogical_council_member: {
    role: "pedagogical_council_member",
    metricHints: ["classes", "students", "admissions"],
    actions: [
      { href: "/academic/timetable", key: "reviewTimetable" },
      { href: "/analytics", key: "academicAnalytics", variant: "outline" },
    ],
  },
  cashier: {
    role: "cashier",
    metricHints: ["collected", "outstanding"],
    actions: [
      { href: "/finance/payments", key: "recordPayment" },
      { href: "/finance/outstanding", key: "unpaidList", variant: "ghost" },
      { href: "/finance/invoices", key: "findInvoice", variant: "ghost" },
    ],
  },
  accountant: {
    role: "accountant",
    metricHints: ["collected", "outstanding", "payroll", "expenses", "budget"],
    actions: [
      { href: "/finance/budget", key: "yearlyBudget" },
      { href: "/finance/reports", key: "financeReports", variant: "ghost" },
      { href: "/finance/payroll", key: "payroll", variant: "ghost" },
      { href: "/finance/expenses", key: "expenses", variant: "ghost" },
      { href: "/finance/fee-structure", key: "feeStructures", variant: "outline" },
    ],
  },
  finance_officer: {
    role: "finance_officer",
    metricHints: ["collected", "outstanding", "payroll", "expenses", "budget"],
    actions: [
      { href: "/finance/budget", key: "yearlyBudget" },
      { href: "/finance/outstanding", key: "outstandingFees", variant: "ghost" },
      { href: "/finance/payments", key: "recordPayment", variant: "ghost" },
      { href: "/finance/invoices", key: "createInvoice", variant: "ghost" },
      { href: "/finance/reports", key: "reports", variant: "outline" },
    ],
  },
};

const FALLBACK: WorkspaceSpec = {
  role: "academic_admin",
  metricHints: ["students", "classes", "admissions"],
  actions: [
    { href: "/academic/students", key: "students" },
    { href: "/academic/admissions", key: "admissions", variant: "ghost" },
  ],
};

export function getRoleWorkspace(
  role: string | null | undefined,
  t: Translator
): RoleWorkspace {
  const normalized = normalizeRole(role);
  const specId = normalized in SPECS ? normalized : "fallback";
  const spec = SPECS[specId] ?? FALLBACK;
  const prefix = `workspace.${specId}`;
  return {
    role: normalized,
    title: t(`${prefix}.title`),
    subtitle: t(`${prefix}.subtitle`),
    focusQuestion: t(`${prefix}.focusQuestion`),
    quickActions: spec.actions.map((action) => ({
      href: action.href,
      label: t(`${prefix}.${action.key}`),
      variant: action.variant,
    })),
    metricHints: spec.metricHints,
  };
}
