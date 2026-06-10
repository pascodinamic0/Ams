import { format } from "date-fns";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTeacherClasses, getAssignmentsByTeacher } from "@/lib/db";
import { AssignmentForm } from "./assignment-form";
import { DeleteAssignmentButton } from "./delete-button";

export default async function AssignmentsPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return <p className="text-sm text-slate-500">Please sign in to manage assignments.</p>;
  }

  const [classes, assignments] = await Promise.all([
    getTeacherClasses(profile.id),
    getAssignmentsByTeacher(profile.id),
  ]);
  const tableData = assignments.map((row) => ({
    ...row,
    due_date_display: row.due_date
      ? format(new Date(row.due_date as string), "MMM d, yyyy")
      : "—",
    submissions_display: `${row.submission_count} submitted · ${row.graded_count} graded`,
    actions: <DeleteAssignmentButton id={row.id as string} />,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assignments</h1>

      {classes.length > 0 ? (
        <AssignmentForm classes={classes.map((c) => ({ id: c.id, name: c.name }))} />
      ) : (
        <p className="text-sm text-slate-500">No classes assigned yet.</p>
      )}

      {assignments.length === 0 ? (
        <EmptyState title="No assignments yet" description="Create your first assignment above." />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "title", header: "Title", accessorKey: "title", sortable: true },
            { id: "class", header: "Class", accessorKey: "class_name" },
            { id: "due_date", header: "Due", accessorKey: "due_date_display" },
            { id: "submissions", header: "Submissions", accessorKey: "submissions_display" },
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
