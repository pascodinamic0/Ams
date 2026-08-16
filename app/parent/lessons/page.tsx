import { format } from "date-fns";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getGuardianByAuthUserId,
  getLinkedStudentsForGuardian,
  getLessonMaterialsForGuardianStudents,
} from "@/lib/db";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LessonMaterialCard } from "@/components/lessons/lesson-material-card";
import { getTranslations } from "next-intl/server";

export default async function ParentLessonsPage() {
  const t = await getTranslations("parent");
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title={t("notSignedIn")} description={t("notSignedInDescLessons")} />
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
  const materials = await getLessonMaterialsForGuardianStudents(
    children.map((c) => ({ id: c.id, name: c.name }))
  );

  const tableData = materials.map((row) => ({
    ...row,
    row_key: `${row.student_id}:${row.id}`,
    date_display: format(new Date(row.lesson_date), "MMM d, yyyy"),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("lessonsTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("lessonsPageSubtitle")}</p>
      </div>

      {children.length === 0 ? (
        <EmptyState
          title={t("noStudentsLinked")}
          description={t("noStudentsLinkedDesc")}
        />
      ) : materials.length === 0 ? (
        <EmptyState
          title={t("noMissedLessons")}
          description={t("noMissedLessonsDesc")}
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <DataTable
              data={tableData}
              keyField="row_key"
              columns={[
                { id: "student", header: t("colStudent"), accessorKey: "student_name", sortable: true },
                { id: "title", header: t("colLesson"), accessorKey: "title", sortable: true },
                { id: "subject", header: t("colSubject"), accessorKey: "subject_name" },
                { id: "date", header: t("colDate"), accessorKey: "date_display", sortable: true },
              ]}
            />
          </div>
          <div className="space-y-3 lg:hidden">
            {materials.map((material) => (
              <LessonMaterialCard
                key={`${material.student_id}:${material.id}`}
                material={material}
                showStudentName={material.student_name}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
