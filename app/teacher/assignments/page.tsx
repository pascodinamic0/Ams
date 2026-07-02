import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTeacherClasses, getAssignmentsByTeacher } from "@/lib/db";
import { AssignmentForm } from "./assignment-form";
import { DeleteAssignmentButton } from "./delete-button";

export default async function AssignmentsPage() {
  const t = await getTranslations("teacher");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  if (!profile) {
    return <p className="text-sm text-stone-500">{t("signInRequiredAssignments")}</p>;
  }

  const [classes, assignments] = await Promise.all([
    getTeacherClasses(profile.id),
    getAssignmentsByTeacher(profile.id),
  ]);
  const tableData = assignments.map((row) => ({
    ...row,
    due_date_display: row.due_date
      ? format(new Date(row.due_date as string), "MMM d, yyyy")
      : tc("emptyDash"),
    submissions_display: t("submissionsCount", {
      submitted: row.submission_count,
      graded: row.graded_count,
    }),
    actions: <DeleteAssignmentButton id={row.id as string} />,
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
    </div>
  );
}
