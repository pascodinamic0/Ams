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

const WORKSPACES: Partial<Record<UserRole, RoleWorkspace>> = {
  academic_admin: {
    role: "academic_admin",
    title: "School control center",
    subtitle: "Configure the school, manage the team, and keep academic operations on track.",
    focusQuestion: "What needs school-wide control today?",
    quickActions: [
      { href: "/academic/team", label: "Manage team" },
      { href: "/academic/settings", label: "School settings", variant: "ghost" },
      { href: "/academic/students/new", label: "Add student", variant: "ghost" },
      { href: "/academic/tasks", label: "Open task board", variant: "outline" },
    ],
    metricHints: ["students", "classes", "admissions", "openTasks"],
  },
  admin_coordinator: {
    role: "admin_coordinator",
    title: "Coordination board",
    subtitle: "Track unfinished work across departments and push follow-ups to the right people.",
    focusQuestion: "What is overdue across the school?",
    quickActions: [
      { href: "/academic/tasks", label: "Manage tasks" },
      { href: "/academic/admissions", label: "Check admissions", variant: "ghost" },
      { href: "/academic/students", label: "Review students", variant: "ghost" },
      { href: "/outreach", label: "Send outreach", variant: "outline" },
    ],
    metricHints: ["openTasks", "overdueTasks", "admissions", "students"],
  },
  principal: {
    role: "principal",
    title: "Leadership oversight",
    subtitle: "Review school health, approve key decisions, and escalate blocked work.",
    focusQuestion: "What needs my decision today?",
    quickActions: [
      { href: "/academic/tasks", label: "Approvals & tasks" },
      { href: "/academic/admissions", label: "Review admissions", variant: "ghost" },
      { href: "/academic/discipline", label: "Discipline cases", variant: "ghost" },
      { href: "/analytics", label: "Open reports", variant: "outline" },
    ],
    metricHints: ["admissions", "openTasks", "openIncidents", "students"],
  },
  registrar: {
    role: "registrar",
    title: "Student records office",
    subtitle: "Keep student master data, guardians, and administrative records complete.",
    focusQuestion: "Which student records are incomplete?",
    quickActions: [
      { href: "/academic/students/new", label: "Add student" },
      { href: "/academic/students", label: "Student registry", variant: "ghost" },
      { href: "/academic/guardians", label: "Guardians", variant: "ghost" },
      { href: "/academic/admissions", label: "Admissions intake", variant: "outline" },
    ],
    metricHints: ["students", "admissions", "classes"],
  },
  admissions_officer: {
    role: "admissions_officer",
    title: "Enrollment pipeline",
    subtitle: "Move applications from inquiry to enrolled students without losing follow-up.",
    focusQuestion: "Which applications are blocked?",
    quickActions: [
      { href: "/academic/admissions", label: "Review applications" },
      { href: "/academic/students/new", label: "Create student", variant: "ghost" },
      { href: "/academic/tasks", label: "Follow-up tasks", variant: "outline" },
    ],
    metricHints: ["admissions", "students", "openTasks"],
  },
  pedagogy_coordinator: {
    role: "pedagogy_coordinator",
    title: "Academic planning",
    subtitle: "Organize classes, subjects, timetable, and curriculum quality.",
    focusQuestion: "Is teaching structure ready for this week?",
    quickActions: [
      { href: "/academic/timetable", label: "Build timetable" },
      { href: "/academic/classes", label: "Manage classes", variant: "ghost" },
      { href: "/academic/curriculum", label: "Curriculum", variant: "ghost" },
      { href: "/analytics", label: "Academic reports", variant: "outline" },
    ],
    metricHints: ["classes", "students", "admissions"],
  },
  discipline_officer: {
    role: "discipline_officer",
    title: "Discipline desk",
    subtitle: "Log incidents, follow open cases, and escalate serious conduct issues.",
    focusQuestion: "Which behavior cases need follow-up?",
    quickActions: [
      { href: "/academic/discipline", label: "Open cases" },
      { href: "/academic/students", label: "Find student", variant: "ghost" },
      { href: "/analytics/attendance", label: "Attendance patterns", variant: "outline" },
    ],
    metricHints: ["openIncidents", "students", "admissions"],
  },
  supervisor: {
    role: "supervisor",
    title: "Daily supervision",
    subtitle: "Monitor presence, report issues quickly, and keep the school day orderly.",
    focusQuestion: "What needs supervision right now?",
    quickActions: [
      { href: "/academic/discipline", label: "Report incident" },
      { href: "/academic/timetable", label: "Today's timetable", variant: "ghost" },
      { href: "/analytics/attendance", label: "Attendance", variant: "outline" },
    ],
    metricHints: ["openIncidents", "students", "classes"],
  },
  pedagogical_council_member: {
    role: "pedagogical_council_member",
    title: "Pedagogical review",
    subtitle: "Review academic structure and recommend improvements without day-to-day edits.",
    focusQuestion: "What needs council attention?",
    quickActions: [
      { href: "/academic/curriculum", label: "Review curriculum" },
      { href: "/academic/timetable", label: "Review timetable", variant: "ghost" },
      { href: "/analytics", label: "Academic analytics", variant: "outline" },
    ],
    metricHints: ["classes", "students", "admissions"],
  },
  cashier: {
    role: "cashier",
    title: "Payment desk",
    subtitle: "Collect fees, confirm balances, and keep daily receipts clean.",
    focusQuestion: "Who still needs to pay today?",
    quickActions: [
      { href: "/finance/payments", label: "Record payment" },
      { href: "/finance/invoices", label: "Find invoice", variant: "ghost" },
      { href: "/finance/invoices/bulk", label: "Account demands", variant: "outline" },
    ],
    metricHints: ["collected", "outstanding"],
  },
  accountant: {
    role: "accountant",
    title: "Finance control",
    subtitle: "Control fee structures, expenses, payroll, and financial reporting.",
    focusQuestion: "Is money controlled and report-ready?",
    quickActions: [
      { href: "/finance/reports", label: "Finance reports" },
      { href: "/finance/payroll", label: "Payroll", variant: "ghost" },
      { href: "/finance/expenses", label: "Expenses", variant: "ghost" },
      { href: "/finance/fee-structure", label: "Fee structures", variant: "outline" },
    ],
    metricHints: ["collected", "outstanding", "payroll", "expenses"],
  },
  finance_officer: {
    role: "finance_officer",
    title: "Finance office",
    subtitle: "Manage invoices, payments, payroll, expenses, and fee operations.",
    focusQuestion: "What finance work is unfinished?",
    quickActions: [
      { href: "/finance/payments", label: "Record payment" },
      { href: "/finance/invoices/bulk", label: "Account demands", variant: "ghost" },
      { href: "/finance/reports", label: "Reports", variant: "outline" },
    ],
    metricHints: ["collected", "outstanding", "payroll", "expenses"],
  },
};

const FALLBACK: RoleWorkspace = {
  role: "academic_admin",
  title: "Academic workspace",
  subtitle: "Manage school academic operations.",
  focusQuestion: "What should I finish today?",
  quickActions: [
    { href: "/academic/students", label: "Students" },
    { href: "/academic/admissions", label: "Admissions", variant: "ghost" },
  ],
  metricHints: ["students", "classes", "admissions"],
};

export function getRoleWorkspace(role: string | null | undefined): RoleWorkspace {
  const normalized = normalizeRole(role);
  return WORKSPACES[normalized] ?? { ...FALLBACK, role: normalized };
}
