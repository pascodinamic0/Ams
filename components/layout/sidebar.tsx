"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
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

const iconClass = "h-4 w-4";

interface NavItem {
  href: string;
  labelKey: keyof NavLabels;
  icon: React.ReactNode;
}

type NavLabels = {
  dashboard: string;
  schools: string;
  websiteTemplates: string;
  users: string;
  roles: string;
  auditLogs: string;
  features: string;
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
  invoices: string;
  outstandingFees: string;
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
  monthlyActivity: string;
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
  outstandingFees: <AlertCircle className={iconClass} />,
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
    { href: "/admin", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/admin/schools", labelKey: "schools", icon: icon.schools },
    { href: "/admin/websites", labelKey: "websiteTemplates", icon: icon.website },
    { href: "/admin/users", labelKey: "users", icon: icon.users },
    { href: "/admin/roles", labelKey: "roles", icon: icon.roles },
    { href: "/admin/audit", labelKey: "auditLogs", icon: icon.audit },
    { href: "/admin/features", labelKey: "features", icon: icon.features },
    { href: "/outreach", labelKey: "outreach", icon: icon.outreach },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  academic_admin: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/academic/website", labelKey: "publicWebsite", icon: icon.website },
    { href: "/academic/settings", labelKey: "schoolSettings", icon: icon.settings },
    { href: "/billing", labelKey: "billing", icon: icon.billing },
    { href: "/academic/team", labelKey: "team", icon: icon.users },
    { href: "/academic/tasks", labelKey: "tasks", icon: icon.assignments },
    { href: "/academic/reports/monthly", labelKey: "monthlyActivity", icon: icon.reports },
    { href: "/academic/students", labelKey: "students", icon: icon.students },
    { href: "/academic/admissions", labelKey: "admissions", icon: icon.admissions },
    { href: "/academic/classes", labelKey: "classes", icon: icon.classes },
    { href: "/academic/subjects", labelKey: "subjects", icon: icon.subjects },
    { href: "/academic/timetable", labelKey: "timetable", icon: icon.timetable },
    { href: "/outreach", labelKey: "outreach", icon: icon.outreach },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  admin_coordinator: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/academic/tasks", labelKey: "tasks", icon: icon.assignments },
    { href: "/academic/students", labelKey: "students", icon: icon.students },
    { href: "/academic/admissions", labelKey: "admissions", icon: icon.admissions },
    { href: "/outreach", labelKey: "outreach", icon: icon.outreach },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  registrar: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/academic/students", labelKey: "students", icon: icon.students },
    { href: "/academic/admissions", labelKey: "admissions", icon: icon.admissions },
    { href: "/academic/tasks", labelKey: "tasks", icon: icon.assignments },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  admissions_officer: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/academic/admissions", labelKey: "admissions", icon: icon.admissions },
    { href: "/academic/students", labelKey: "students", icon: icon.students },
    { href: "/academic/tasks", labelKey: "tasks", icon: icon.assignments },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  pedagogy_coordinator: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/academic/students", labelKey: "students", icon: icon.students },
    { href: "/academic/classes", labelKey: "classes", icon: icon.classes },
    { href: "/academic/subjects", labelKey: "subjects", icon: icon.subjects },
    { href: "/academic/timetable", labelKey: "timetable", icon: icon.timetable },
    { href: "/academic/tasks", labelKey: "tasks", icon: icon.assignments },
    { href: "/analytics", labelKey: "reports", icon: icon.reports },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  principal: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/billing", labelKey: "billing", icon: icon.billing },
    { href: "/academic/tasks", labelKey: "tasks", icon: icon.assignments },
    { href: "/academic/reports/monthly", labelKey: "monthlyActivity", icon: icon.reports },
    { href: "/academic/students", labelKey: "students", icon: icon.students },
    { href: "/academic/admissions", labelKey: "admissions", icon: icon.admissions },
    { href: "/academic/classes", labelKey: "classes", icon: icon.classes },
    { href: "/academic/timetable", labelKey: "timetable", icon: icon.timetable },
    { href: "/analytics", labelKey: "reports", icon: icon.reports },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  teacher: [
    { href: "/teacher", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/teacher/classes", labelKey: "myClasses", icon: icon.classes },
    { href: "/teacher/attendance", labelKey: "attendance", icon: icon.attendance },
    { href: "/teacher/gradebook", labelKey: "gradebook", icon: icon.grades },
    { href: "/teacher/assignments", labelKey: "assignments", icon: icon.assignments },
    { href: "/teacher/exams", labelKey: "exams", icon: icon.timetable },
    { href: "/teacher/report-cards", labelKey: "reportCards", icon: icon.reports },
    { href: "/teacher/discipline", labelKey: "discipline", icon: icon.roles },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  finance_officer: [
    { href: "/finance", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/billing", labelKey: "billing", icon: icon.billing },
    { href: "/finance/fee-structure", labelKey: "feeStructure", icon: icon.feeStructure },
    { href: "/finance/invoices", labelKey: "invoices", icon: icon.invoices },
    { href: "/finance/outstanding", labelKey: "outstandingFees", icon: icon.outstandingFees },
    { href: "/finance/payments", labelKey: "payments", icon: icon.payments },
    { href: "/finance/payroll", labelKey: "payroll", icon: icon.payroll },
    { href: "/finance/expenses", labelKey: "expenses", icon: icon.expenses },
    { href: "/finance/budget", labelKey: "budget", icon: icon.budget },
    { href: "/finance/reports", labelKey: "reports", icon: icon.reports },
    { href: "/finance/fee-reminders", labelKey: "feeReminders", icon: icon.reminders },
    { href: "/finance/settings", labelKey: "schoolSettings", icon: icon.settings },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  cashier: [
    { href: "/finance", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/finance/invoices", labelKey: "invoices", icon: icon.invoices },
    { href: "/finance/outstanding", labelKey: "outstandingFees", icon: icon.outstandingFees },
    { href: "/finance/payments", labelKey: "payments", icon: icon.payments },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  accountant: [
    { href: "/finance", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/billing", labelKey: "billing", icon: icon.billing },
    { href: "/finance/fee-structure", labelKey: "feeStructure", icon: icon.feeStructure },
    { href: "/finance/invoices", labelKey: "invoices", icon: icon.invoices },
    { href: "/finance/outstanding", labelKey: "outstandingFees", icon: icon.outstandingFees },
    { href: "/finance/payments", labelKey: "payments", icon: icon.payments },
    { href: "/finance/payroll", labelKey: "payroll", icon: icon.payroll },
    { href: "/finance/expenses", labelKey: "expenses", icon: icon.expenses },
    { href: "/finance/budget", labelKey: "budget", icon: icon.budget },
    { href: "/finance/reports", labelKey: "reports", icon: icon.reports },
    { href: "/finance/fee-reminders", labelKey: "feeReminders", icon: icon.reminders },
    { href: "/finance/settings", labelKey: "schoolSettings", icon: icon.settings },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  operations_manager: [
    { href: "/operations", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/operations/library", labelKey: "library", icon: icon.library },
    { href: "/operations/transport", labelKey: "transport", icon: icon.transport },
    { href: "/operations/events", labelKey: "events", icon: icon.events },
    { href: "/operations/staff", labelKey: "staff", icon: icon.staff },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  operations_officer: [
    { href: "/operations", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/operations/library", labelKey: "library", icon: icon.library },
    { href: "/operations/transport", labelKey: "transport", icon: icon.transport },
    { href: "/operations/events", labelKey: "events", icon: icon.events },
    { href: "/operations/staff", labelKey: "staff", icon: icon.staff },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  discipline_officer: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/academic/discipline", labelKey: "discipline", icon: icon.roles },
    { href: "/academic/students", labelKey: "students", icon: icon.students },
    { href: "/analytics/attendance", labelKey: "attendance", icon: icon.attendance },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  supervisor: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/academic/discipline", labelKey: "discipline", icon: icon.roles },
    { href: "/academic/students", labelKey: "students", icon: icon.students },
    { href: "/academic/timetable", labelKey: "timetable", icon: icon.timetable },
    { href: "/analytics/attendance", labelKey: "attendance", icon: icon.attendance },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  pedagogical_council_member: [
    { href: "/academic", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/academic/timetable", labelKey: "timetable", icon: icon.timetable },
    { href: "/analytics", labelKey: "reports", icon: icon.reports },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
  ],
  parent: [
    { href: "/parent", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/parent/fees", labelKey: "fees", icon: icon.fees },
    { href: "/parent/timetable", labelKey: "timetable", icon: icon.timetable },
    { href: "/parent/assignments", labelKey: "assignments", icon: icon.assignments },
    { href: "/parent/lessons", labelKey: "missedLessons", icon: icon.timetable },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
    { href: "/parent/events", labelKey: "events", icon: icon.events },
    { href: "/parent/transport", labelKey: "transport", icon: icon.transport },
    { href: "/parent/performance", labelKey: "performance", icon: icon.performance },
  ],
  student: [
    { href: "/student", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/student/timetable", labelKey: "timetable", icon: icon.timetable },
    { href: "/student/assignments", labelKey: "assignments", icon: icon.assignments },
    { href: "/student/lessons", labelKey: "missedLessons", icon: icon.timetable },
    { href: "/student/grades", labelKey: "grades", icon: icon.grades },
    { href: "/student/report-card", labelKey: "reportCards", icon: icon.reports },
    { href: "/student/library", labelKey: "library", icon: icon.library },
    { href: "/student/events", labelKey: "events", icon: icon.events },
  ],
  analytics: [
    { href: "/analytics", labelKey: "dashboard", icon: icon.dashboard },
    { href: "/analytics/students", labelKey: "students", icon: icon.students },
    { href: "/analytics/attendance", labelKey: "attendance", icon: icon.attendance },
    { href: "/analytics/finance", labelKey: "finance", icon: icon.finance },
    { href: "/messages", labelKey: "messages", icon: icon.chat },
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
  const navItems = getNavForRole(role);
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tMessages = useTranslations("messages");
  const { unreadMessages } = useShellBadges();

  const navHrefs = navItems.map((item) => item.href);

  return (
    <nav className="flex flex-col gap-0.5 px-3" aria-label={tCommon("sidebar")}>
      {navItems.map((item) => {
        const isActive = isNavItemActive(pathname, item.href, navHrefs);
        const showUnreadBadge = item.href === "/messages" && unreadMessages > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
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
        );
      })}
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
