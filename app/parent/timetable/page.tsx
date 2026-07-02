import { getCurrentProfile } from "@/lib/auth/session";
import {
  getGuardianByAuthUserId,
  getLinkedStudentsForGuardian,
  getTimetableForClass,
} from "@/lib/db";
import { TimetableView } from "@/components/portal/timetable-view";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";

export default async function ParentTimetablePage() {
  const t = await getTranslations("parent");
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title={t("notSignedIn")} description={t("notSignedInDescTimetable")} />
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

  const timetables = await Promise.all(
    children.map(async (child) => ({
      child,
      slots: child.class_id ? await getTimetableForClass(child.class_id) : [],
    }))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("timetableTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("timetableSubtitle")}</p>
      </div>

      {children.length === 0 ? (
        <EmptyState
          title={t("noStudentsLinked")}
          description={t("noStudentsLinkedDesc")}
        />
      ) : (
        <div className="space-y-10">
          {timetables.map(({ child, slots }) => (
            <div key={child.id}>
              {!child.class_id ? (
                <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900">
                  <h2 className="font-semibold text-stone-900 dark:text-white">{child.name}</h2>
                  <p className="mt-2 text-sm text-stone-500">{t("notAssignedToClass")}</p>
                </div>
              ) : (
                <TimetableView
                  slots={slots}
                  title={`${child.name}${child.class_name ? ` · ${child.class_name}` : ""}`}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
