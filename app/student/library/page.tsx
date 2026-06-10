import { format } from "date-fns";
import { getCurrentProfile } from "@/lib/auth/session";
import { getStudentByAuthUserId, getBookIssuesForStudent } from "@/lib/db";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";

const statusStyles: Record<string, string> = {
  active: "text-blue-600",
  returned: "text-green-600",
  overdue: "text-red-600",
};

export default async function StudentLibraryPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title="Not signed in" description="Please log in to view library records." />
    );
  }

  const student = await getStudentByAuthUserId(profile.id);
  if (!student) {
    return (
      <EmptyState
        title="No student profile"
        description="Your account is not linked to a student record."
      />
    );
  }

  const issues = await getBookIssuesForStudent(student.id);
  const tableData = issues.map((row) => ({
    ...row,
    issued_at_display: format(new Date(row.issued_at), "MMM d, yyyy"),
    due_at_display: format(new Date(row.due_at), "MMM d, yyyy"),
    status_display: (
      <span className={`capitalize font-medium ${statusStyles[row.status] ?? ""}`}>
        {row.status}
      </span>
    ),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Library</h1>
        <p className="mt-1 text-sm text-slate-500">
          Books issued to you and return status.
        </p>
      </div>

      {issues.length === 0 ? (
        <EmptyState
          title="No books issued"
          description="You have no library books on record."
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "title", header: "Title", accessorKey: "title", sortable: true },
            { id: "author", header: "Author", accessorKey: "author" },
            { id: "issued_at", header: "Issued", accessorKey: "issued_at_display" },
            { id: "due_at", header: "Due", accessorKey: "due_at_display" },
            { id: "status", header: "Status", accessorKey: "status_display" },
          ]}
        />
      )}
    </div>
  );
}
