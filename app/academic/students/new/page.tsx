import Link from "next/link";
import { StudentForm } from "@/components/forms/student-form";
import { Button } from "@/components/ui/button";
import { getSchoolCampusId, getClasses, getGuardians } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export default async function NewStudentPage() {
  const t = await getTranslations("academic");
  const profile = await getCurrentProfile();
  const schoolId = profile?.school_id ?? "";
  let branchId = profile?.branch_id ?? "";

  if (!branchId && schoolId) {
    branchId = (await getSchoolCampusId(schoolId)) ?? "";
  }

  const [classes, guardians] = await Promise.all([
    getClasses(branchId || undefined),
    getGuardians(),
  ]);

  if (!schoolId || !branchId) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("onboardStudent")}</h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {t("schoolRequiredOnboard")}
          </p>
        </div>
        <Link href="/academic/students">
          <Button variant="ghost">{t("backToStudents")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("onboardStudent")}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {t("onboardDescription")}
        </p>
      </div>
      <StudentForm
        schoolId={schoolId}
        branchId={branchId}
        classes={classes.map((c) => ({ id: c.id, name: c.name }))}
        existingGuardians={guardians.map((g) => ({ id: g.id, name: g.name }))}
      />
    </div>
  );
}
