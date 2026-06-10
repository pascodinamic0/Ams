import { getCurrentProfile } from "@/lib/auth/session";
import { getStudentByAuthUserId, getGradesForStudent } from "@/lib/db";
import { CopyableBadge } from "@/components/ui/copyable-badge";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";

export default async function StudentGradesPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title="Not signed in" description="Please log in to view grades." />
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

  const grades = await getGradesForStudent(student.id);
  const tableData = grades.map((row) => ({
    ...row,
    marks_display: row.marks !== null ? `${row.marks}%` : "—",
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Grades</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your marks and report card (read-only).
          </p>
        </div>
        {student.student_id && (
          <CopyableBadge value={student.student_id} label={`ID: ${student.student_id}`} />
        )}
      </div>

      {grades.length === 0 ? (
        <EmptyState
          title="No grades recorded"
          description="Your grades will appear here once teachers publish them."
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "subject", header: "Subject", accessorKey: "subject_name", sortable: true },
            { id: "term", header: "Term", accessorKey: "term", sortable: true },
            { id: "marks", header: "Marks", accessorKey: "marks_display" },
            { id: "grade", header: "Grade", accessorKey: "grade" },
          ]}
        />
      )}
    </div>
  );
}
