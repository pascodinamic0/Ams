import { format } from "date-fns";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getGuardianByAuthUserId,
  getLinkedStudentsForGuardian,
  getAssignmentsForGuardianStudents,
} from "@/lib/db";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ParentAssignmentsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title="Not signed in" description="Please log in to view assignments." />
    );
  }

  const guardian = await getGuardianByAuthUserId(profile.id);
  if (!guardian) {
    return (
      <EmptyState
        title="No guardian profile"
        description="Your account is not linked to a guardian profile."
      />
    );
  }

  const children = await getLinkedStudentsForGuardian(guardian.id);
  const assignments = await getAssignmentsForGuardianStudents(
    children.map((c) => ({ id: c.id, name: c.name }))
  );
  const tableData = assignments.map((row) => ({
    ...row,
    due_date_display: row.due_date
      ? format(new Date(row.due_date), "MMM d, yyyy")
      : "—",
    status_display: row.submitted_at
      ? row.grade !== null
        ? `Graded (${row.grade}%)`
        : "Submitted"
      : "Pending",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments</h1>
        <p className="mt-1 text-sm text-slate-500">
          View assignments for your linked children (read-only).
        </p>
      </div>

      {children.length === 0 ? (
        <EmptyState
          title="No students linked"
          description="Contact the school to link your children to your account."
        />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No assignments"
          description="There are no assignments for your children's classes yet."
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "student", header: "Student", accessorKey: "student_name", sortable: true },
            { id: "title", header: "Assignment", accessorKey: "title", sortable: true },
            { id: "teacher", header: "Teacher", accessorKey: "teacher_name" },
            { id: "due_date", header: "Due", accessorKey: "due_date_display", sortable: true },
            { id: "status", header: "Status", accessorKey: "status_display" },
          ]}
        />
      )}
    </div>
  );
}
