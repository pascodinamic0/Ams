import { format } from "date-fns";
import { getCurrentProfile } from "@/lib/auth/session";
import { getStudentByAuthUserId, getAssignmentsForStudent } from "@/lib/db";
import { EmptyState } from "@/components/ui/empty-state";

export default async function StudentAssignmentsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title="Not signed in" description="Please log in to view assignments." />
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

  const assignments = await getAssignmentsForStudent(student.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments</h1>
        <p className="mt-1 text-sm text-slate-500">
          View assignments for your class and track submission status.
        </p>
      </div>

      {!student.class_id ? (
        <EmptyState
          title="No class assigned"
          description="You are not assigned to a class yet."
        />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No assignments"
          description="Your teachers have not posted any assignments yet."
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const isSubmitted = Boolean(a.submitted_at);
            const isOverdue =
              !isSubmitted && a.due_date && new Date(a.due_date) < new Date();
            return (
              <div
                key={a.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-slate-900 dark:text-white">{a.title}</h2>
                    {a.teacher_name && (
                      <p className="text-xs text-slate-500">Teacher: {a.teacher_name}</p>
                    )}
                    {a.description && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {a.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {a.due_date && (
                      <span className="text-xs text-slate-500">
                        Due {format(new Date(a.due_date), "MMM d, yyyy")}
                      </span>
                    )}
                    {isSubmitted ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {a.grade !== null ? `Graded · ${a.grade}%` : "Submitted"}
                      </span>
                    ) : (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isOverdue
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}
                      >
                        {isOverdue ? "Overdue" : "Pending"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
