/**
 * School modules the platform owner can turn on or off.
 * Baseline modules default on when a school has no toggle row, so existing
 * schools keep working. A daily release can add a key with defaultEnabled false.
 */

export type FeatureGroup =
  | "academic"
  | "finance"
  | "operations"
  | "portals"
  | "communication"
  | "website";

export type FeatureDefinition = {
  key: string;
  group: FeatureGroup;
  label: string;
  description: string;
  /** Used when the school has no feature_toggles row. */
  defaultEnabled: boolean;
  /** Longest matching prefix wins, after portal-wide gates. */
  paths: string[];
  /** Sidebar and mobile-tab hrefs hidden when this module is off. */
  navHrefs: string[];
};

export const FEATURE_GROUPS: FeatureGroup[] = [
  "academic",
  "finance",
  "operations",
  "portals",
  "communication",
  "website",
];

export const FEATURE_CATALOG: FeatureDefinition[] = [
  {
    key: "students",
    group: "academic",
    label: "Students",
    description: "Student records, enrollment, and student analytics",
    defaultEnabled: true,
    paths: ["/academic/students", "/analytics/students"],
    navHrefs: ["/academic/students", "/analytics/students"],
  },
  {
    key: "online_admissions",
    group: "academic",
    label: "Online admissions",
    description: "Public admission form and the admissions desk",
    defaultEnabled: true,
    paths: ["/academic/admissions"],
    navHrefs: ["/academic/admissions"],
  },
  {
    key: "classes",
    group: "academic",
    label: "Classes",
    description: "Classes, sections, and teacher class lists",
    defaultEnabled: true,
    paths: ["/academic/classes", "/teacher/classes"],
    navHrefs: ["/academic/classes", "/teacher/classes"],
  },
  {
    key: "subjects",
    group: "academic",
    label: "Subjects",
    description: "Subject catalog for the school",
    defaultEnabled: true,
    paths: ["/academic/subjects"],
    navHrefs: ["/academic/subjects"],
  },
  {
    key: "timetable",
    group: "academic",
    label: "Timetable",
    description: "Class timetable for staff, parents, and students",
    defaultEnabled: true,
    paths: ["/academic/timetable", "/parent/timetable", "/student/timetable"],
    navHrefs: ["/academic/timetable", "/parent/timetable", "/student/timetable"],
  },
  {
    key: "attendance",
    group: "academic",
    label: "Attendance",
    description: "Daily attendance and attendance reports",
    defaultEnabled: true,
    paths: ["/teacher/attendance", "/analytics/attendance"],
    navHrefs: ["/teacher/attendance", "/analytics/attendance"],
  },
  {
    key: "gradebook",
    group: "academic",
    label: "Gradebook",
    description: "Grades for teachers, students, and parents",
    defaultEnabled: true,
    paths: ["/teacher/gradebook", "/student/grades", "/parent/performance"],
    navHrefs: ["/teacher/gradebook", "/student/grades", "/parent/performance"],
  },
  {
    key: "assignments",
    group: "academic",
    label: "Assignments",
    description: "Assignments and missed-lesson materials",
    defaultEnabled: true,
    paths: [
      "/teacher/assignments",
      "/parent/assignments",
      "/student/assignments",
      "/parent/lessons",
      "/student/lessons",
    ],
    navHrefs: [
      "/teacher/assignments",
      "/parent/assignments",
      "/student/assignments",
      "/parent/lessons",
      "/student/lessons",
    ],
  },
  {
    key: "exams",
    group: "academic",
    label: "Exams",
    description: "Exam sessions for teachers",
    defaultEnabled: true,
    paths: ["/teacher/exams"],
    navHrefs: ["/teacher/exams"],
  },
  {
    key: "report_cards",
    group: "academic",
    label: "Report cards",
    description: "Report cards for teachers and students",
    defaultEnabled: true,
    paths: ["/teacher/report-cards", "/student/report-card"],
    navHrefs: ["/teacher/report-cards", "/student/report-card"],
  },
  {
    key: "discipline",
    group: "academic",
    label: "Discipline",
    description: "Discipline incidents and follow-up",
    defaultEnabled: true,
    paths: ["/academic/discipline", "/teacher/discipline"],
    navHrefs: ["/academic/discipline", "/teacher/discipline"],
  },
  {
    key: "tasks",
    group: "academic",
    label: "Tasks",
    description: "Internal task board for school staff",
    defaultEnabled: true,
    paths: ["/academic/tasks"],
    navHrefs: ["/academic/tasks"],
  },
  {
    key: "fee_structure",
    group: "finance",
    label: "Fee structure",
    description: "Fee amounts by class and term",
    defaultEnabled: true,
    paths: ["/finance/fee-structure"],
    navHrefs: ["/finance/fee-structure"],
  },
  {
    key: "invoices",
    group: "finance",
    label: "Invoices",
    description: "Invoices, outstanding balances, and enrollment payment handoff",
    defaultEnabled: true,
    paths: ["/finance/invoices", "/finance/outstanding", "/finance/enrollments"],
    navHrefs: ["/finance/invoices", "/finance/outstanding", "/finance/enrollments"],
  },
  {
    key: "payments",
    group: "finance",
    label: "Payments",
    description: "Recorded fee payments",
    defaultEnabled: true,
    paths: ["/finance/payments"],
    navHrefs: ["/finance/payments"],
  },
  {
    key: "payroll",
    group: "finance",
    label: "Payroll",
    description: "Staff payroll runs",
    defaultEnabled: true,
    paths: ["/finance/payroll"],
    navHrefs: ["/finance/payroll"],
  },
  {
    key: "expenses",
    group: "finance",
    label: "Expenses",
    description: "School expenses and receipts",
    defaultEnabled: true,
    paths: ["/finance/expenses"],
    navHrefs: ["/finance/expenses"],
  },
  {
    key: "budget",
    group: "finance",
    label: "Budget",
    description: "Budget plans against actual spending",
    defaultEnabled: true,
    paths: ["/finance/budget"],
    navHrefs: ["/finance/budget"],
  },
  {
    key: "fee_reminders",
    group: "finance",
    label: "Fee reminders",
    description: "Reminders for unpaid fees",
    defaultEnabled: true,
    paths: ["/finance/fee-reminders"],
    navHrefs: ["/finance/fee-reminders"],
  },
  {
    key: "finance_reports",
    group: "finance",
    label: "Finance reports",
    description: "Finance reports and finance analytics",
    defaultEnabled: true,
    paths: ["/finance/reports", "/analytics/finance"],
    navHrefs: ["/finance/reports", "/analytics/finance"],
  },
  {
    key: "online_payments",
    group: "finance",
    label: "Online payments",
    description: "Parent fee payment portal",
    defaultEnabled: true,
    paths: ["/parent/fees"],
    navHrefs: ["/parent/fees"],
  },
  {
    key: "library",
    group: "operations",
    label: "Library",
    description: "Library catalog and book issues",
    defaultEnabled: true,
    paths: ["/operations/library", "/student/library"],
    navHrefs: ["/operations/library", "/student/library"],
  },
  {
    key: "transport",
    group: "operations",
    label: "Transport",
    description: "Bus routes and student transport",
    defaultEnabled: true,
    paths: ["/operations/transport", "/parent/transport"],
    navHrefs: ["/operations/transport", "/parent/transport"],
  },
  {
    key: "events",
    group: "operations",
    label: "Events",
    description: "School events for staff, parents, and students",
    defaultEnabled: true,
    paths: ["/operations/events", "/parent/events", "/student/events"],
    navHrefs: ["/operations/events", "/parent/events", "/student/events"],
  },
  {
    key: "staff_directory",
    group: "operations",
    label: "Staff directory",
    description: "Operations staff list",
    defaultEnabled: true,
    paths: ["/operations/staff"],
    navHrefs: ["/operations/staff"],
  },
  {
    key: "parent_portal",
    group: "portals",
    label: "Parent portal",
    description: "The whole parent workspace",
    defaultEnabled: true,
    paths: [],
    navHrefs: ["/parent"],
  },
  {
    key: "student_portal",
    group: "portals",
    label: "Student portal",
    description: "The whole student workspace",
    defaultEnabled: true,
    paths: [],
    navHrefs: ["/student"],
  },
  {
    key: "messaging",
    group: "communication",
    label: "Messaging",
    description: "In-app messaging between users",
    defaultEnabled: true,
    paths: ["/messages"],
    navHrefs: ["/messages"],
  },
  {
    key: "outreach",
    group: "communication",
    label: "Outreach",
    description: "Announcements and outreach campaigns",
    defaultEnabled: true,
    paths: ["/outreach"],
    navHrefs: ["/outreach"],
  },
  {
    key: "public_website",
    group: "website",
    label: "Public website",
    description: "The school's public website editor",
    defaultEnabled: true,
    paths: ["/academic/website"],
    navHrefs: ["/academic/website"],
  },
];

const BY_KEY = new Map(FEATURE_CATALOG.map((feature) => [feature.key, feature]));

const PATH_RULES = FEATURE_CATALOG.flatMap((feature) =>
  feature.paths.map((path) => ({ path, key: feature.key }))
).sort((a, b) => b.path.length - a.path.length);

export function getFeatureDefinition(key: string): FeatureDefinition | undefined {
  return BY_KEY.get(key);
}

export function isKnownFeatureKey(key: string): boolean {
  return BY_KEY.has(key);
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

/** Portal gate first, then the longest specific prefix. */
export function requiredFeatureKeys(pathname: string): string[] {
  const path = normalizePath(pathname);
  const keys: string[] = [];
  if (path === "/parent" || path.startsWith("/parent/")) keys.push("parent_portal");
  if (path === "/student" || path.startsWith("/student/")) keys.push("student_portal");
  for (const rule of PATH_RULES) {
    if (path === rule.path || path.startsWith(`${rule.path}/`)) {
      if (!keys.includes(rule.key)) keys.push(rule.key);
      break;
    }
  }
  return keys;
}

export function schoolFeatureStorageKey(schoolId: string, featureKey: string): string {
  return `school:${schoolId}:${featureKey}`;
}

export function featureKeyFromStorageKey(storageKey: string): string | null {
  const parts = storageKey.split(":");
  if (parts.length < 3 || parts[0] !== "school") return null;
  return parts.slice(2).join(":");
}
