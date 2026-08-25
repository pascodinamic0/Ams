import {
  isStudentStatus,
  STUDENT_STATUS_BADGE_CLASS,
} from "@/lib/students/status";

export function StudentStatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  const styles = isStudentStatus(status)
    ? STUDENT_STATUS_BADGE_CLASS[status]
    : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300";

  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize ${styles}`}
    >
      {label}
    </span>
  );
}
