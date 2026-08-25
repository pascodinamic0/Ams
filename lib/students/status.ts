import type { StudentStatus } from "@/lib/validations/student";
import { STUDENT_STATUSES } from "@/lib/validations/student";

export const STUDENT_STATUS_BADGE_CLASS: Record<StudentStatus, string> = {
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  inactive:
    "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200",
  graduated: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
};

export function isStudentStatus(value: string): value is StudentStatus {
  return (STUDENT_STATUSES as readonly string[]).includes(value);
}

export function formatStudentStatusLabel(
  status: string,
  copy: Record<StudentStatus, string>
): string {
  if (isStudentStatus(status)) return copy[status];
  return status;
}
