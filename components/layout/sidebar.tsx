"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  Building2,
  Bus,
  Calendar,
  CheckCircle,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileText,
  Globe,
  GraduationCap,
  Home,
  Landmark,
  Library,
  Megaphone,
  MessageSquare,
  PieChart,
  Puzzle,
  Settings,
  Shield,
  Sparkles,
  Tags,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useShellBadges } from "@/components/layout/shell-badges-provider";
import { isNavItemActive } from "@/lib/layout/nav-active";
import { useHiddenNavHrefs } from "@/components/layout/feature-nav";

const iconClass = "h-4 w-4";

const NAV_SECTIONS = [
  "overview",
  "people",
  "academics",
  "fees",
  "spending",
  "operations",
  "platform",
  "reports",
  "school",
  "communication",
] as const;

type NavSection = (typeof NAV_SECTIONS)[number];

interface NavItem {
  href: string;
  labelKey: keyof NavLabels;
  icon: React.ReactNode;
  section: NavSection;
}

function groupNavItems(items: NavItem[]): { section: NavSection; items: NavItem[] }[] {
  return NAV_SECTIONS.flatMap((section) => {
    const sectionItems = items.filter((item) => item.section === section);
    return sectionItems.length > 0 ? [{ section, items: sectionItems }] : [];
  });
}

type NavLabels = {
  dashboard: string;
  schools: string;
  websiteTemplates: string;
  users: string;
  roles: string;
  auditLogs: string;
  features: string;
  releases: string;
  outreach: string;
  messages: string;
  publicWebsite: string;
  schoolSettings: string;
  team: string;
  students: string;
  admissions: string;
  classes: string;
  subjects: string;
  timetable: string;
  myClasses: string;
  attendance: string;
  gradebook: string;
  assignments: string;
  missedLessons: string;
  exams: string;
  reportCards: string;
  feeStructure: string;
  pendingEnrollments: string;
  invoices: string;
  payments: string;
  payroll: string;
  expenses: string;
  reports: string;
  feeReminders: string;
  library: string;
  transport: string;
  events: string;
  staff: string;
  fees: string;
  performance: string;
  grades: string;
  finance: string;
  tasks: string;
  discipline: string;
  activityReport: string;
  budget: string;
  billing: string;
};

const icon = {
  dashboard: <Home className={iconClass} />,
  schools: <Building2 className={iconClass} />,
  branches: <Globe className={iconClass} />,
  users: <Users className={iconClass} />,
  roles: <Shield className={iconClass} />,
  audit: <ClipboardList className={iconClass} />,
  features: <Puzzle className={iconClass} />,
  website: <Globe className={iconClass} />,
  settings: <Settings className={iconClass} />,
  students: <GraduationCap className={iconClass} />,
  guardians: <Users className={iconClass} />,
  admissions: <UserPlus className={iconClass} />,
  classes: <BookOpen className={iconClass} />,
  subjects: <BookMarked className={iconClass} />,
  timetable: <Calendar className={iconClass} />,
  finance: <Landmark className={iconClass} />,
  messages: <MessageSquare className={iconClass} />,
  library: <Library className={iconClass} />,
  transport: <Bus className={iconClass} />,
  events: <Sparkles className={iconClass} />,
  staff: <Users className={iconClass} />,
  grades: <BarChart3 className={iconClass} />,
  assignments: <ClipboardList className={iconClass} />,
  reports: <TrendingUp className={iconClass} />,
  fees: <CircleDollarSign className={iconClass} />,
  feeStructure: <Tags className={iconClass} />,
  invoices: <FileText className={iconClass} />,
  payments: <Banknote className={iconClass} />,
  expenses: <Wallet className={iconClass} />,
  budget: <PieChart className={iconClass} />,
  payroll: <Users className={iconClass} />,
  attendance: <CheckCircle className={iconClass} />,
  performance: <TrendingUp className={iconClass} />,
  outreach: <Megaphone className={iconClass} />,
  chat: <MessageSquare className={iconClass} />,
  reminders: <Bell className={iconClass} />,
  billing: <CreditCard className={iconClass} />,
};

const ROLE_NAV: Record<string, NavItem[]> = {
  super_admin: [
    { href: "/admin", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/admin/schools", labelKey: "schools", icon: icon.schools, section: "platform" },
    { href: "/admin/websites", labelKey: "websiteTemplates", icon: icon.website, section: "platform" },
    { href: "/admin/users", labelKey: "users", icon: icon.users, section: "platform" },
    { href: "/admin/roles", labelKey: "roles", icon: icon.roles, section: "platform" },
    { href: "/admin/audit", labelKey: "auditLogs", icon: icon.audit, section: "platform" },
    { href: "/admin/features", labelKey: "features", icon: icon.features, section: "platform" },
    { href: "/admin/releases", labelKey: "releases", icon: icon.events, section: "platform" },
    { href: "/outreach", labelKey: "outreach", icon: icon.outreach, section: "communication" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  academic_admin: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/academic/tasks", labelKey: "tasks", icon: icon.assignments, section: "overview" },
    { href: "/academic/team", labelKey: "team", icon: icon.users, section: "people" },
    { href: "/academic/students", labelKey: "students", icon: icon.students, section: "people" },
    { href: "/academic/admissions", labelKey: "admissions", icon: icon.admissions, section: "people" },
    { href: "/academic/classes", labelKey: "classes", icon: icon.classes, section: "academics" },
    { href: "/academic/subjects", labelKey: "subjects", icon: icon.subjects, section: "academics" },
    { href: "/academic/timetable", labelKey: "timetable", icon: icon.timetable, section: "academics" },
    { href: "/academic/reports/monthly", labelKey: "activityReport", icon: icon.reports, section: "reports" },
    { href: "/academic/website", labelKey: "publicWebsite", icon: icon.website, section: "school" },
    { href: "/academic/settings", labelKey: "schoolSettings", icon: icon.settings, section: "school" },
    { href: "/billing", labelKey: "billing", icon: icon.billing, section: "school" },
    { href: "/outreach", labelKey: "outreach", icon: icon.outreach, section: "communication" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  admin_coordinator: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/academic/tasks", labelKey: "tasks", icon: icon.assignments, section: "overview" },
    { href: "/academic/students", labelKey: "students", icon: icon.students, section: "people" },
    { href: "/academic/admissions", labelKey: "admissions", icon: icon.admissions, section: "people" },
    { href: "/outreach", labelKey: "outreach", icon: icon.outreach, section: "communication" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  registrar: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/academic/tasks", labelKey: "tasks", icon: icon.assignments, section: "overview" },
    { href: "/academic/students", labelKey: "students", icon: icon.students, section: "people" },
    { href: "/academic/admissions", labelKey: "admissions", icon: icon.admissions, section: "people" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  admissions_officer: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/academic/tasks", labelKey: "tasks", icon: icon.assignments, section: "overview" },
    { href: "/academic/admissions", labelKey: "admissions", icon: icon.admissions, section: "people" },
    { href: "/academic/students", labelKey: "students", icon: icon.students, section: "people" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  pedagogy_coordinator: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/academic/tasks", labelKey: "tasks", icon: icon.assignments, section: "overview" },
    { href: "/academic/students", labelKey: "students", icon: icon.students, section: "people" },
    { href: "/academic/classes", labelKey: "classes", icon: icon.classes, section: "academics" },
    { href: "/academic/subjects", labelKey: "subjects", icon: icon.subjects, section: "academics" },
    { href: "/academic/timetable", labelKey: "timetable", icon: icon.timetable, section: "academics" },
    { href: "/analytics", labelKey: "reports", icon: icon.reports, section: "reports" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  principal: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/academic/tasks", labelKey: "tasks", icon: icon.assignments, section: "overview" },
    { href: "/academic/students", labelKey: "students", icon: icon.students, section: "people" },
    { href: "/academic/admissions", labelKey: "admissions", icon: icon.admissions, section: "people" },
    { href: "/academic/classes", labelKey: "classes", icon: icon.classes, section: "academics" },
    { href: "/academic/timetable", labelKey: "timetable", icon: icon.timetable, section: "academics" },
    { href: "/academic/reports/monthly", labelKey: "activityReport", icon: icon.reports, section: "reports" },
    { href: "/analytics", labelKey: "reports", icon: icon.reports, section: "reports" },
    { href: "/billing", labelKey: "billing", icon: icon.billing, section: "school" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  teacher: [
    { href: "/teacher", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/teacher/classes", labelKey: "myClasses", icon: icon.classes, section: "academics" },
    { href: "/teacher/attendance", labelKey: "attendance", icon: icon.attendance, section: "academics" },
    { href: "/teacher/gradebook", labelKey: "gradebook", icon: icon.grades, section: "academics" },
    { href: "/teacher/assignments", labelKey: "assignments", icon: icon.assignments, section: "academics" },
    { href: "/teacher/exams", labelKey: "exams", icon: icon.timetable, section: "academics" },
    { href: "/teacher/discipline", labelKey: "discipline", icon: icon.roles, section: "academics" },
    { href: "/teacher/report-cards", labelKey: "reportCards", icon: icon.reports, section: "reports" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  finance_officer: [
    { href: "/finance", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/finance/enrollments", labelKey: "pendingEnrollments", icon: icon.invoices, section: "fees" },
    { href: "/finance/fee-structure", labelKey: "feeStructure", icon: icon.feeStructure, section: "fees" },
    { href: "/finance/invoices", labelKey: "invoices", icon: icon.invoices, section: "fees" },
    { href: "/finance/payments", labelKey: "payments", icon: icon.payments, section: "fees" },
    { href: "/finance/fee-reminders", labelKey: "feeReminders", icon: icon.reminders, section: "fees" },
    { href: "/finance/payroll", labelKey: "payroll", icon: icon.payroll, section: "spending" },
    { href: "/finance/expenses", labelKey: "expenses", icon: icon.expenses, section: "spending" },
    { href: "/finance/budget", labelKey: "budget", icon: icon.budget, section: "spending" },
    { href: "/finance/reports/activity/monthly", labelKey: "activityReport", icon: icon.reports, section: "reports" },
    { href: "/finance/reports", labelKey: "reports", icon: icon.reports, section: "reports" },
    { href: "/billing", labelKey: "billing", icon: icon.billing, section: "school" },
    { href: "/finance/settings", labelKey: "schoolSettings", icon: icon.settings, section: "school" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  cashier: [
    { href: "/finance", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/finance/enrollments", labelKey: "pendingEnrollments", icon: icon.invoices, section: "fees" },
    { href: "/finance/invoices", labelKey: "invoices", icon: icon.invoices, section: "fees" },
    { href: "/finance/payments", labelKey: "payments", icon: icon.payments, section: "fees" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  accountant: [
    { href: "/finance", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/finance/enrollments", labelKey: "pendingEnrollments", icon: icon.invoices, section: "fees" },
    { href: "/finance/fee-structure", labelKey: "feeStructure", icon: icon.feeStructure, section: "fees" },
    { href: "/finance/invoices", labelKey: "invoices", icon: icon.invoices, section: "fees" },
    { href: "/finance/payments", labelKey: "payments", icon: icon.payments, section: "fees" },
    { href: "/finance/fee-reminders", labelKey: "feeReminders", icon: icon.reminders, section: "fees" },
    { href: "/finance/payroll", labelKey: "payroll", icon: icon.payroll, section: "spending" },
    { href: "/finance/expenses", labelKey: "expenses", icon: icon.expenses, section: "spending" },
    { href: "/finance/budget", labelKey: "budget", icon: icon.budget, section: "spending" },
    { href: "/finance/reports/activity/monthly", labelKey: "activityReport", icon: icon.reports, section: "reports" },
    { href: "/finance/reports", labelKey: "reports", icon: icon.reports, section: "reports" },
    { href: "/billing", labelKey: "billing", icon: icon.billing, section: "school" },
    { href: "/finance/settings", labelKey: "schoolSettings", icon: icon.settings, section: "school" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  operations_manager: [
    { href: "/operations", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/operations/library", labelKey: "library", icon: icon.library, section: "operations" },
    { href: "/operations/transport", labelKey: "transport", icon: icon.transport, section: "operations" },
    { href: "/operations/events", labelKey: "events", icon: icon.events, section: "operations" },
    { href: "/operations/staff", labelKey: "staff", icon: icon.staff, section: "operations" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  operations_officer: [
    { href: "/operations", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/operations/library", labelKey: "library", icon: icon.library, section: "operations" },
    { href: "/operations/transport", labelKey: "transport", icon: icon.transport, section: "operations" },
    { href: "/operations/events", labelKey: "events", icon: icon.events, section: "operations" },
    { href: "/operations/staff", labelKey: "staff", icon: icon.staff, section: "operations" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  discipline_officer: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/academic/students", labelKey: "students", icon: icon.students, section: "people" },
    { href: "/academic/discipline", labelKey: "discipline", icon: icon.roles, section: "academics" },
    { href: "/analytics/attendance", labelKey: "attendance", icon: icon.attendance, section: "reports" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  supervisor: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/academic/students", labelKey: "students", icon: icon.students, section: "people" },
    { href: "/academic/discipline", labelKey: "discipline", icon: icon.roles, section: "academics" },
    { href: "/academic/timetable", labelKey: "timetable", icon: icon.timetable, section: "academics" },
    { href: "/analytics/attendance", labelKey: "attendance", icon: icon.attendance, section: "reports" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  pedagogical_council_member: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/academic/timetable", labelKey: "timetable", icon: icon.timetable, section: "academics" },
    { href: "/analytics", labelKey: "reports", icon: icon.reports, section: "reports" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  parent: [
    { href: "/parent", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/parent/fees", labelKey: "fees", icon: icon.fees, section: "fees" },
    { href: "/parent/timetable", labelKey: "timetable", icon: icon.timetable, section: "academics" },
    { href: "/parent/assignments", labelKey: "assignments", icon: icon.assignments, section: "academics" },
    { href: "/parent/lessons", labelKey: "missedLessons", icon: icon.timetable, section: "academics" },
    { href: "/parent/events", labelKey: "events", icon: icon.events, section: "operations" },
    { href: "/parent/transport", labelKey: "transport", icon: icon.transport, section: "operations" },
    { href: "/parent/performance", labelKey: "performance", icon: icon.performance, section: "reports" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
  student: [
    { href: "/student", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/student/timetable", labelKey: "timetable", icon: icon.timetable, section: "academics" },
    { href: "/student/assignments", labelKey: "assignments", icon: icon.assignments, section: "academics" },
    { href: "/student/lessons", labelKey: "missedLessons", icon: icon.timetable, section: "academics" },
    { href: "/student/grades", labelKey: "grades", icon: icon.grades, section: "academics" },
    { href: "/student/report-card", labelKey: "reportCards", icon: icon.reports, section: "reports" },
    { href: "/student/library", labelKey: "library", icon: icon.library, section: "operations" },
    { href: "/student/events", labelKey: "events", icon: icon.events, section: "operations" },
  ],
  analytics: [
    { href: "/analytics", labelKey: "dashboard", icon: icon.dashboard, section: "overview" },
    { href: "/analytics/students", labelKey: "students", icon: icon.students, section: "reports" },
    { href: "/analytics/attendance", labelKey: "attendance", icon: icon.attendance, section: "reports" },
    { href: "/analytics/finance", labelKey: "finance", icon: icon.finance, section: "reports" },
    { href: "/messages", labelKey: "messages", icon: icon.chat, section: "communication" },
  ],
};

function getNavForRole(role: string): NavItem[] {
  const normalized = role?.toLowerCase().replace(/\s/g, "_") ?? "student";
  return ROLE_NAV[normalized] ?? ROLE_NAV.student;
}

interface SidebarProps {
  role?: string;
}

export function Sidebar({ role = "student" }: SidebarProps) {
  const pathname = usePathname();
  const hiddenHrefs = useHiddenNavHrefs();
  const navItems = getNavForRole(role).filter(
    (item) => !hiddenHrefs.includes(item.href)
  );
  const groups = groupNavItems(navItems);
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tMessages = useTranslations("messages");
  const { unreadMessages } = useShellBadges();

  const navHrefs = navItems.map((item) => item.href);

  return (
    <nav className="flex flex-col px-3" aria-label={tCommon("sidebar")}>
      {groups.map((group, index) => (
        <div key={group.section} className={index === 0 ? undefined : "mt-3"}>
          <h2
            id={`nav-section-${group.section}`}
            className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400"
          >
            {t(`sections.${group.section}`)}
          </h2>
          <ul
            aria-labelledby={`nav-section-${group.section}`}
            className="flex flex-col gap-0.5"
          >
            {group.items.map((item) => {
              const isActive = isNavItemActive(pathname, item.href, navHrefs);
              const showUnreadBadge = item.href === "/messages" && unreadMessages > 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-light text-primary-hover dark:bg-primary-light/60 dark:text-primary"
                        : "text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                    }`}
                  >
                    <span
                      className={`relative ${
                        isActive
                          ? "text-primary dark:text-primary"
                          : "text-stone-600 dark:text-stone-400"
                      }`}
                    >
                      {item.icon}
                      {showUnreadBadge && (
                        <span
                          className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white"
                          aria-label={tMessages("unreadMessages", { count: unreadMessages })}
                        >
                          {unreadMessages > 9 ? "9+" : unreadMessages}
                        </span>
                      )}
                    </span>
                    {t(item.labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export const BOTTOM_NAV_ROUTES: Record<string, string> = {
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
