import type { LucideIcon } from "lucide-react";
import {
  CheckCircle,
  ClipboardList,
  DollarSign,
  GraduationCap,
  Home,
  MessageSquare,
} from "lucide-react";

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
  teacher: [
    { id: "home", href: "/teacher", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/teacher/attendance", labelKey: "attendance", icon: CheckCircle },
    { id: "tab3", href: "/messages", labelKey: "messages", icon: MessageSquare },
  ],
  finance_officer: [
    { id: "home", href: "/finance", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/finance/invoices", labelKey: "invoices", icon: DollarSign },
    { id: "tab3", href: "/finance/payments", labelKey: "payments", icon: ClipboardList },
  ],
  operations_manager: [
    { id: "home", href: "/operations", labelKey: "dashboard", icon: Home },
    { id: "tab2", href: "/operations/events", labelKey: "events", icon: ClipboardList },
    { id: "tab3", href: "/operations/library", labelKey: "library", icon: GraduationCap },
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
    { id: "tab3", href: "/analytics/finance", labelKey: "finance", icon: DollarSign },
  ],
};

export function getMobileTabs(role: string): MobileTabDef[] {
  const normalized = role?.toLowerCase().replace(/\s/g, "_") ?? "student";
  return TAB_PRESETS[normalized] ?? TAB_PRESETS.student;
}

export function isTabActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/academic" || href === "/teacher" || href === "/finance" ||
      href === "/operations" || href === "/parent" || href === "/student" || href === "/analytics") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
