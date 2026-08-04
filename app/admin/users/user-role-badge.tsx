import type { UserRole } from "@/lib/auth/rbac";

const styles: Record<string, string> = {
  super_admin:
    "bg-primary-light text-teal-800 dark:bg-primary-light dark:text-primary",
  academic_admin:
    "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  admin_coordinator:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  registrar:
    "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  admissions_officer:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  pedagogy_coordinator:
    "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300",
  principal:
    "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  teacher: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  finance_officer:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  cashier: "bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-300",
  accountant:
    "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  operations_manager:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  operations_officer:
    "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  discipline_officer:
    "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  supervisor:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  pedagogical_council_member:
    "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  parent: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300",
  student: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  analytics: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
};

const defaultStyle =
  "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300";

export function formatRoleLabel(role: string): string {
  return role.replace(/_/g, " ");
}

export function UserRoleBadge({ role }: { role: string }) {
  const style = styles[role as UserRole] ?? defaultStyle;

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}
    >
      {formatRoleLabel(role)}
    </span>
  );
}
