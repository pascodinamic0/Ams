import type { SchoolStatus } from "@/lib/db/schools";

const styles: Record<SchoolStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  approved:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  suspended:
    "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export function SchoolStatusBadge({ status }: { status: SchoolStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
