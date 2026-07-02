import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { getClasses, getSubjects, getTimetableSlots, getTeachers } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { TimetableBuilder } from "./timetable-builder";

interface PageProps {
  searchParams: Promise<{ class?: string }>;
}

export default async function TimetablePage({ searchParams }: PageProps) {
  const t = await getTranslations("academic");
  const params = await searchParams;
  const profile = await getCurrentProfile();
  const branchId = profile?.branch_id ?? "";
  const schoolId = profile?.school_id ?? "";

  if (!branchId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("timetableTitle")}</h1>
        <EmptyState
          title={t("branchRequired")}
          description={t("branchRequiredTimetable")}
        />
      </div>
    );
  }

  const [classes, subjects, teachers] = await Promise.all([
    getClasses(branchId),
    getSubjects(branchId),
    schoolId ? getTeachers(schoolId) : Promise.resolve([]),
  ]);

  const selectedClassId =
    params.class && classes.some((c) => c.id === params.class)
      ? params.class
      : classes[0]?.id ?? "";

  const slots = selectedClassId ? await getTimetableSlots(selectedClassId) : [];

  return (
    <TimetableBuilder
      classes={classes.map((c) => ({ id: c.id, name: c.name }))}
      subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
      teachers={teachers}
      slots={slots}
      selectedClassId={selectedClassId}
    />
  );
}
