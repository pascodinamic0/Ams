"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

const ROLE_NAV: Record<string, NavItem[]> = {
  super_admin: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/schools", label: "Schools" },
    { href: "/admin/branches", label: "Branches" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/roles", label: "Roles" },
    { href: "/admin/audit", label: "Audit" },
    { href: "/admin/features", label: "Features" },
  ],
  academic_admin: [
    { href: "/academic", label: "Dashboard" },
    { href: "/academic/students", label: "Students" },
    { href: "/academic/guardians", label: "Guardians" },
    { href: "/academic/admissions", label: "Admissions" },
    { href: "/academic/classes", label: "Classes" },
    { href: "/academic/sections", label: "Sections" },
    { href: "/academic/subjects", label: "Subjects" },
    { href: "/academic/timetable", label: "Timetable" },
    { href: "/academic/curriculum", label: "Curriculum" },
  ],
  teacher: [
    { href: "/teacher", label: "Dashboard" },
    { href: "/teacher/classes", label: "My Classes" },
    { href: "/teacher/attendance", label: "Attendance" },
    { href: "/teacher/gradebook", label: "Gradebook" },
    { href: "/teacher/assignments", label: "Assignments" },
    { href: "/teacher/exams", label: "Exams" },
    { href: "/teacher/report-cards", label: "Report Cards" },
    { href: "/teacher/messages", label: "Messages" },
  ],
  finance_officer: [
    { href: "/finance", label: "Dashboard" },
    { href: "/finance/fee-structure", label: "Fee Structure" },
    { href: "/finance/invoices", label: "Invoices" },
    { href: "/finance/payments", label: "Payments" },
    { href: "/finance/payroll", label: "Payroll" },
    { href: "/finance/expenses", label: "Expenses" },
    { href: "/finance/reports", label: "Reports" },
  ],
  operations_manager: [
    { href: "/operations", label: "Dashboard" },
    { href: "/operations/library", label: "Library" },
    { href: "/operations/transport", label: "Transport" },
    { href: "/operations/events", label: "Events" },
    { href: "/operations/staff", label: "Staff" },
  ],
  parent: [
    { href: "/parent", label: "Dashboard" },
    { href: "/parent/fees", label: "Fees" },
    { href: "/parent/timetable", label: "Timetable" },
    { href: "/parent/assignments", label: "Assignments" },
    { href: "/parent/messages", label: "Messages" },
    { href: "/parent/events", label: "Events" },
    { href: "/parent/transport", label: "Transport" },
  ],
  student: [
    { href: "/student", label: "Dashboard" },
    { href: "/student/timetable", label: "Timetable" },
    { href: "/student/assignments", label: "Assignments" },
    { href: "/student/grades", label: "Grades" },
    { href: "/student/library", label: "Library" },
    { href: "/student/messages", label: "Messages" },
    { href: "/student/events", label: "Events" },
  ],
  analytics: [
    { href: "/analytics", label: "Dashboard" },
    { href: "/analytics/branches", label: "Branches" },
    { href: "/analytics/students", label: "Students" },
    { href: "/analytics/attendance", label: "Attendance" },
    { href: "/analytics/finance", label: "Finance" },
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

  return (
    <nav className="flex flex-col gap-1" aria-label="Sidebar">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export const BOTTOM_NAV_ROUTES: Record<string, string> = {
  super_admin: "/admin",
  academic_admin: "/academic",
  teacher: "/teacher",
  finance_officer: "/finance",
  operations_manager: "/operations",
  parent: "/parent",
  student: "/student",
  analytics: "/analytics",
};
