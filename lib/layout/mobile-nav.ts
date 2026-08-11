import type { LucideIcon } from "lucide-react";
import {
  CheckCircle,
  ClipboardList,
  DollarSign,
  GraduationCap,
  Home,
  MessageSquare,
} from "lucide-react";
import { isNavItemActive } from "@/lib/layout/nav-active";

export type MobileTabId = "home" | "tab2" | "tab3" | "messages";

export interface MobileTabDef {
  id: MobileTabId;
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

const TAB_PRESETS: Record<string, MobileTabDef[]> = {
  super_admin: [
    { id: "home", href: "/admin", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/admin/schools", labelKey: "schools", icon: GraduationCap },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  academic_admin: [
    { id: "home", href: "/academic", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/academic/students", labelKey: "students", icon: GraduationCap },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  admin_coordinator: [
    { id: "home", href: "/academic", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/academic/tasks", labelKey: "tasks", icon: ClipboardList },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  registrar: [
    { id: "home", href: "/academic", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/academic/students", labelKey: "students", icon: GraduationCap },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  admissions_officer: [
    { id: "home", href: "/academic", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/academic/admissions", labelKey: "admissions", icon: GraduationCap },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  pedagogy_coordinator: [
    { id: "home", href: "/academic", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/academic/timetable", labelKey: "timetable", icon: ClipboardList },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  principal: [
    { id: "home", href: "/academic", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/academic/tasks", labelKey: "tasks", icon: ClipboardList },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  teacher: [
    { id: "home", href: "/teacher", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/teacher/attendance", labelKey: "attendance", icon: CheckCircle },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  finance_officer: [
    { id: "home", href: "/finance", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/finance/invoices", labelKey: "invoices", icon: DollarSign },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  cashier: [
    { id: "home", href: "/finance", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/finance/invoices", labelKey: "invoices", icon: DollarSign },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  accountant: [
    { id: "home", href: "/finance", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/finance/reports", labelKey: "reports", icon: DollarSign },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  operations_manager: [
    { id: "home", href: "/operations", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/operations/events", labelKey: "events", icon: ClipboardList },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  operations_officer: [
    { id: "home", href: "/operations", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/operations/events", labelKey: "events", icon: ClipboardList },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  discipline_officer: [
    { id: "home", href: "/academic", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/academic/discipline", labelKey: "discipline", icon: CheckCircle },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  supervisor: [
    { id: "home", href: "/academic", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/academic/discipline", labelKey: "discipline", icon: CheckCircle },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  pedagogical_council_member: [
    { id: "home", href: "/academic", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/analytics", labelKey: "reports", icon: DollarSign },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  parent: [
    { id: "home", href: "/parent", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/parent/fees", labelKey: "fees", icon: DollarSign },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  student: [
    { id: "home", href: "/student", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/student/timetable", labelKey: "timetable", icon: ClipboardList },
    { id: "tab3", href: "/student/assignments", labelKey: "assignments", icon: GraduationCap },
  ],
  analytics: [
    { id: "home", href: "/analytics", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/analytics/students", labelKey: "students", icon: GraduationCap },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
};

export function getMobileTabs(role: string): MobileTabDef[] {
  const normalized = role?.toLowerCase().replace(/\s/g, "_") ?? "student";
  return TAB_PRESETS[normalized] ?? TAB_PRESETS.student;
}

export function isTabActive(pathname: string, href: string, allHrefs?: string[]) {
  if (allHrefs?.length) {
    return isNavItemActive(pathname, href, allHrefs);
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
