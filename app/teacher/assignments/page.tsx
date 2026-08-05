import Link from "next/link";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getTeacherClasses,
  getAssignmentsByTeacher,
  getAssignmentSubmissions,
} from "@/lib/db";
import { AssignmentForm } from "./assignment-form";
import { DeleteAssignmentButton } from "./delete-button";
import { GradeSubmissionForm } from "./grade-submission-form";

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ assignment?: string }>;
}) {
  const t = await getTranslations("teacher");
  const tc = await getTranslations("common");
  const { assignment: selectedId } = await searchParams;
  const profile = await getCurrentProfile();
  if (!profile) {
    return <p className="text-sm text-stone-500">{t("signInRequiredAssignments")}</p>;
  }

  const [classes, assignments] = await Promise.all([
    getTeacherClasses(profile.id),
    getAssignmentsByTeacher(profile.id),
  ]);

  const selected =
    selectedId && assignments.some((a) => a.id === selectedId)
      ? assignments.find((a) => a.id === selectedId)!
      : null;

  const submissions = selected
    ? await getAssignmentSubmissions(selected.id)
    : [];

  const tableData = assignments.map((row) => ({
    ...row,
    due_date_display: row.due_date
      ? format(new Date(row.due_date as string), "MMM d, yyyy")
      : tc("emptyDash"),
    submissions_display: t("submissionsCount", {
      submitted: row.submission_count,
      graded: row.graded_count,
    }),
    actions: (
      <div className="flex items-center gap-2">
        <Link href={`/teacher/assignments?assignment=${row.id}`}>
          <Button size="sm" variant="outline">
            {t("reviewSubmissions")}
          </Button>
        </Link>
        <DeleteAssignmentButton id={row.id as string} />
      </div>
    ),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("assignmentsTitle")}</h1>

      {classes.length > 0 ? (
        <AssignmentForm classes={classes.map((c) => ({ id: c.id, name: c.name }))} />
      ) : (
        <p className="text-sm text-stone-500">{t("noClassesAssignedYet")}</p>
      )}

      {assignments.length === 0 ? (
        <EmptyState title={t("noAssignmentsYet")} description={t("createFirstAssignment")} />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "title", header: t("tableTitle"), accessorKey: "title", sortable: true },
            { id: "class", header: t("tableClass"), accessorKey: "class_name" },
            { id: "due_date", header: t("tableDue"), accessorKey: "due_date_display" },
            { id: "submissions", header: t("tableSubmissions"), accessorKey: "submissions_display" },
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}

      {selected ? (
        <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
                {t("submissionsFor", { title: selected.title })}
              </h2>
              <p className="text-sm text-stone-500">
                {selected.class_name} · {t("submissionsCount", {
                  submitted: selected.submission_count,
                  graded: selected.graded_count,
                })}
              </p>
            </div>
            <Link href="/teacher/assignments">
              <Button variant="ghost" size="sm">
                {tc("close")}
              </Button>
            </Link>
          </div>

          {submissions.length === 0 ? (
            <EmptyState
              title={t("noStudentsInClass")}
              description={t("noStudentsInClassDesc")}
            />
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => {
                const submitted = Boolean(sub.submitted_at);
                return (
                  <div
                    key={sub.student_id}
                    className="rounded-lg border border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-800/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-stone-900 dark:text-white">
                          {sub.student_name}
                        </p>
                        <p className="text-xs text-stone-500">
                          {submitted
                            ? t("submittedOn", {
                                date: format(new Date(sub.submitted_at!), "MMM d, yyyy"),
                              })
                            : t("notSubmittedYet")}
                        </p>
                        {sub.text_response ? (
                          <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700 dark:text-stone-300">
                            {sub.text_response}
                          </p>
                        ) : null}
                      </div>
                      {submitted && sub.id ? (
                        <GradeSubmissionForm
                          submissionId={sub.id}
                          initialGrade={sub.grade}
                          gradeLabel={t("gradeLabel")}
                          saveLabel={t("saveGrade")}
                        />
                      ) : (
                        <span className="text-xs text-stone-400">{t("waitingForSubmission")}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
