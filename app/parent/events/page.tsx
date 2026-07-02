import { format } from "date-fns";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getGuardianByAuthUserId,
  getLinkedStudentsForGuardian,
  getEvents,
} from "@/lib/db";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";

export default async function ParentEventsPage() {
  const t = await getTranslations("parent");
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title={t("notSignedIn")} description={t("notSignedInDescEvents")} />
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
  const branchId = children[0]?.branch_id ?? profile.branch_id ?? undefined;
  const today = format(new Date(), "yyyy-MM-dd");
  const events = await getEvents({
    branchId: branchId ?? undefined,
    schoolId: !branchId ? guardian.school_id : undefined,
    fromDate: today,
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
          {t("eventsPageTitle")}
        </h1>
        <p className="mt-1 text-sm text-stone-500">{t("eventsSubtitle")}</p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title={t("noUpcomingEvents")}
          description={t("noUpcomingEventsDesc")}
        />
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900"
            >
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary-light text-primary-hover dark:bg-primary-light/40 dark:text-primary">
                <span className="text-xs font-medium">
                  {format(new Date(event.date), "MMM")}
                </span>
                <span className="text-lg font-bold leading-none">
                  {format(new Date(event.date), "d")}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-stone-900 dark:text-white">
                    {event.title}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      event.type === "holiday"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {event.type === "holiday" ? t("holiday") : t("event")}
                  </span>
                </div>
                <p className="text-sm text-stone-500">
                  {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                </p>
                {event.description && (
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
