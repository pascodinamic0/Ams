import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { getCurriculum, getSubjects } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { CurriculumForm } from "./curriculum-form";
import { CurriculumTable } from "./curriculum-table";

export default async function CurriculumPage() {
  const t = await getTranslations("academic");
  const profile = await getCurrentProfile();
  const branchId = profile?.branch_id ?? "";

  if (!branchId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("curriculumTitle")}</h1>
        <EmptyState
          title={t("branchRequired")}
          description={t("branchRequiredCurriculum")}
        />
      </div>
    );
  }

  const [curriculum, subjects] = await Promise.all([
    getCurriculum(branchId),
    getSubjects(branchId),
  ]);

  const subjectOptions = subjects.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("curriculumTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {t("curriculumDescription")}
        </p>
      </div>

      <CurriculumForm branchId={branchId} subjects={subjectOptions} />

      {subjects.length === 0 && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          {t("curriculumSubjectsHint")}
        </p>
      )}

      {curriculum.length === 0 ? (
        <EmptyState
          title={t("noCurriculumYet")}
          description={t("noCurriculumDesc")}
        />
      ) : (
        <CurriculumTable
          curriculum={curriculum}
          branchId={branchId}
          subjects={subjectOptions}
        />
      )}
    </div>
  );
}
