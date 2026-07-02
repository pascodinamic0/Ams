import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTeacherClasses, getGradesForClass } from "@/lib/db";
import { getSubjects } from "@/lib/db/subjects";
import { GradebookGrid } from "./gradebook-grid";

export default async function GradebookPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; subject?: string; term?: string }>;
}) {
  const t = await getTranslations("teacher");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  if (!profile) {
    return <p className="text-sm text-stone-500">{t("signInRequiredGradebook")}</p>;
  }

  const params = await searchParams;
  const [classes, subjects] = await Promise.all([
    getTeacherClasses(profile.id),
    getSubjects(profile.branch_id ?? undefined),
  ]);

  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("gradebookTitle")}</h1>
        <EmptyState title={t("noClassesAssigned")} description={t("noClassesAssignedDesc")} />
      </div>
    );
  }

  const classId = params.class && classes.some((c) => c.id === params.class)
    ? params.class
    : classes[0].id;
  const subjectId = params.subject ?? "";
  const term = params.term ?? "Term 1";

  const rows =
    subjectId
      ? await getGradesForClass({ classId, subjectId, term })
      : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("gradebookTitle")}</h1>
      <Suspense fallback={<p className="text-sm text-stone-500">{tc("loading")}</p>}>
        <GradebookGrid
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
          subjects={subjects}
          initialClassId={classId}
          initialSubjectId={subjectId}
          initialTerm={term}
          rows={rows}
        />
      </Suspense>
    </div>
  );
}
