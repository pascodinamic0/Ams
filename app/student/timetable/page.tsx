import { getCurrentProfile } from "@/lib/auth/session";
import { getStudentByAuthUserId, getTimetableForClass } from "@/lib/db";
import { TimetableView } from "@/components/portal/timetable-view";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";

export default async function StudentTimetablePage() {
  const t = await getTranslations("student");
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title={t("notSignedIn")} description={t("notSignedInDescTimetable")} />
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

  const slots = student.class_id ? await getTimetableForClass(student.class_id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("timetableTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {student.class_name
            ? t("weeklyScheduleFor", { className: student.class_name })
            : t("timetableSubtitle")}
        </p>
      </div>

      {!student.class_id ? (
        <EmptyState
          title={t("noClassAssigned")}
          description={t("noClassAssignedDesc")}
        />
      ) : (
        <TimetableView slots={slots} />
      )}
    </div>
  );
}
