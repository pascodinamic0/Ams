import { getCurrentProfile } from "@/lib/auth/session";
import { getStudentByAuthUserId, getLessonMaterialsForStudent } from "@/lib/db";
import { EmptyState } from "@/components/ui/empty-state";
import { LessonMaterialCard } from "@/components/lessons/lesson-material-card";
import { getTranslations } from "next-intl/server";

export default async function StudentLessonsPage() {
  const t = await getTranslations("student");
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title={t("notSignedIn")} description={t("notSignedInDescLessons")} />
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

  const materials = await getLessonMaterialsForStudent(student.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("lessonsTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("lessonsPageSubtitle")}</p>
      </div>

      {materials.length === 0 ? (
        <EmptyState
          title={t("noMissedLessons")}
          description={t("noMissedLessonsDesc")}
        />
      ) : (
        <div className="space-y-3">
          {materials.map((material) => (
            <LessonMaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </div>
  );
}
