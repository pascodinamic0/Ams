import { getCurrentProfile } from "@/lib/auth/session";
import { getStudentByAuthUserId, getGradesForStudent } from "@/lib/db";
import { CopyableBadge } from "@/components/ui/copyable-badge";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";

export default async function StudentGradesPage() {
  const t = await getTranslations("student");
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title={t("notSignedIn")} description={t("notSignedInDescGrades")} />
    );
  }

  const student = await getStudentByAuthUserId(profile.id);
  if (!student) {
    return (
      <EmptyState
        title={t("noStudentProfile")}
        description={t("noStudentProfileDescShort")}
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
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("gradesTitle")}</h1>
          <p className="mt-1 text-sm text-stone-500">{t("gradesSubtitle")}</p>
        </div>
        {student.student_id && (
          <CopyableBadge value={student.student_id} label={t("idLabel", { id: student.student_id })} />
        )}
      </div>

      {grades.length === 0 ? (
        <EmptyState
          title={t("noGradesRecorded")}
          description={t("noGradesRecordedDesc")}
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "subject", header: t("colSubject"), accessorKey: "subject_name", sortable: true },
            { id: "term", header: t("colTerm"), accessorKey: "term", sortable: true },
            { id: "marks", header: t("colMarks"), accessorKey: "marks_display" },
            { id: "grade", header: t("colGrade"), accessorKey: "grade" },
          ]}
        />
      )}
    </div>
  );
}
