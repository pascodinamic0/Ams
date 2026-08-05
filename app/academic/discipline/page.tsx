import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { canAccessPath } from "@/lib/auth/rbac";
import { getStudents } from "@/lib/db";
import { getDisciplineIncidents } from "@/lib/db/workspaces";
import { DisciplineBoard } from "./discipline-board";

export default async function AcademicDisciplinePage() {
  const t = await getTranslations("academic");
  const profile = await getCurrentProfile();
  if (!profile?.school_id) redirect("/academic");

  if (!canAccessPath(profile.role, "/academic/discipline")) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("disciplineTitle")}</h1>
        <EmptyState
          title={t("accessDeniedTitle")}
          description={t("accessDeniedDesc")}
          action={
            <Link href="/academic">
              <Button>{t("backToAcademic")}</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const [incidents, students] = await Promise.all([
    getDisciplineIncidents(profile.school_id),
    getStudents({ schoolId: profile.school_id }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("disciplineTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("disciplineSubtitle")}</p>
      </div>
      <DisciplineBoard
        incidents={incidents}
        students={students.map((student) => ({
          id: student.id,
          name: student.name,
        }))}
      />
    </div>
  );
}
