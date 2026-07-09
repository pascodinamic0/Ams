import { format } from "date-fns";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getGuardianByAuthUserId,
  getLinkedStudentsForGuardian,
  getAssignmentsForGuardianStudents,
} from "@/lib/db";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";

export default async function ParentAssignmentsPage() {
  const t = await getTranslations("parent");
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title={t("notSignedIn")} description={t("notSignedInDescAssignments")} />
    );
  }

  const guardian = await getGuardianByAuthUserId(profile.id);
  if (!guardian) {
    return (
      <EmptyState
        title={t("noGuardianProfile")}
        description={t("noGuardianProfileDescShort")}
      />
    );
  }

  const children = await getLinkedStudentsForGuardian(guardian.id);
  const assignments = await getAssignmentsForGuardianStudents(
    children.map((c) => ({ id: c.id, name: c.name }))
  );
  const tableData = assignments.map((row) => ({
    ...row,
    // Same assignment can appear for multiple linked students in one class.
    row_key: `${row.student_id}:${row.id}`,
    due_date_display: row.due_date
      ? format(new Date(row.due_date), "MMM d, yyyy")
      : "—",
    status_display: row.submitted_at
      ? row.grade !== null
        ? t("statusGraded", { grade: row.grade })
        : t("statusSubmitted")
      : t("statusPending"),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("assignmentsTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("assignmentsSubtitle")}</p>
      </div>

      {children.length === 0 ? (
        <EmptyState
          title={t("noStudentsLinked")}
          description={t("noStudentsLinkedDesc")}
        />
      ) : assignments.length === 0 ? (
        <EmptyState
          title={t("noAssignments")}
          description={t("noAssignmentsDesc")}
        />
      ) : (
        <DataTable
          data={tableData}
          keyField="row_key"
          columns={[
            { id: "student", header: t("colStudent"), accessorKey: "student_name", sortable: true },
            { id: "title", header: t("colAssignment"), accessorKey: "title", sortable: true },
            { id: "teacher", header: t("colTeacher"), accessorKey: "teacher_name" },
            { id: "due_date", header: t("colDue"), accessorKey: "due_date_display", sortable: true },
            { id: "status", header: t("colStatus"), accessorKey: "status_display" },
          ]}
        />
      )}
    </div>
  );
}
