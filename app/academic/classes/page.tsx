import { EmptyState } from "@/components/ui/empty-state";
import { getClasses, getTeachers } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { ClassForm } from "./class-form";
import { ClassesTable } from "./classes-table";

export default async function ClassesPage() {
  const t = await getTranslations("academic");
  const profile = await getCurrentProfile();
  const branchId = profile?.branch_id ?? "";
  const classes = branchId ? await getClasses(branchId) : await getClasses();
  const teachers = profile?.school_id
    ? (await getTeachers(profile.school_id)).map((teacher) => ({
        id: teacher.id,
        name: teacher.name ?? "Teacher",
      }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("classesTitle")}</h1>
      {branchId ? (
        <ClassForm branchId={branchId} teachers={teachers} />
      ) : (
        <p className="text-sm text-stone-500">{t("linkSchoolForClasses")}</p>
      )}
      {classes.length === 0 ? (
        <EmptyState title={t("noClassesYet")} description={t("createFirstClass")} />
      ) : (
        <ClassesTable classes={classes} teachers={teachers} />
      )}
    </div>
  );
}
