import type { UserRole } from "@/lib/auth/rbac";

const styles: Record<string, string> = {
  super_admin:
    "bg-primary-light text-teal-800 dark:bg-primary-light dark:text-primary",
  academic_admin:
    "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  teacher: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  finance_officer:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  operations_manager:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
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
