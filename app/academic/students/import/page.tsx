import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { canOverrideClassCapacity } from "@/lib/auth/rbac";
import { getClasses } from "@/lib/db";
import { StudentImportForm } from "./student-import-form";

export default async function StudentImportPage() {
  const t = await getTranslations("academic");
  const profile = await getCurrentProfile();
  const branchId = profile?.branch_id ?? "";
  const schoolId = profile?.school_id ?? "";

  if (!branchId || !schoolId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("importStudents")}</h1>
        <EmptyState
          title={t("schoolContextRequired")}
          description={t("schoolRequiredImport")}
        />
        <Link href="/academic/students">
          <Button variant="outline">{t("backToStudents")}</Button>
        </Link>
      </div>
    );
  }

  const classes = await getClasses(branchId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("importStudents")}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {t("importDescription")}
        </p>
      </div>

      <StudentImportForm
        schoolId={schoolId}
        branchId={branchId}
        classes={classes.map((c) => ({ id: c.id, name: c.name }))}
        canOverrideCapacity={canOverrideClassCapacity(profile?.role)}
      />
    </div>
  );
}
