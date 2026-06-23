import Link from "next/link";
import { format } from "date-fns";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getGuardianByAuthUserId,
  getLinkedStudentsForGuardian,
  getInvoicesForGuardian,
  getUpcomingAssignmentsForStudent,
  getTodaysTimetableForClass,
} from "@/lib/db";
import { CopyableBadge } from "@/components/ui/copyable-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function ParentDashboard() {
  const t = await getTranslations("parent");
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState
        title={t("notSignedIn")}
        description={t("notSignedInDesc")}
      />
    );
  }

  const guardian = await getGuardianByAuthUserId(profile.id);

  if (!guardian) {
    return (
      <EmptyState
        title={t("noGuardianProfile")}
        description={t("noGuardianProfileDesc")}
      />
    );
  }

  const children = await getLinkedStudentsForGuardian(guardian.id);
  const invoices = await getInvoicesForGuardian(guardian.id);
  const outstanding = invoices.filter((i) => Number(i.balance) > 0).length;

  const childPreviews = await Promise.all(
    children.slice(0, 3).map(async (child) => {
      const [todaySlots, upcoming] = await Promise.all([
        child.class_id ? getTodaysTimetableForClass(child.class_id) : Promise.resolve([]),
        getUpcomingAssignmentsForStudent(child.id, 2),
      ]);
      return { child, todaySlots, upcoming };
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("welcome", { name: profile.name ?? "" })}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("welcomeSubtitle")}</p>
      </div>

      {children.length === 0 ? (
        <EmptyState
          title={t("noStudentsLinked")}
          description={t("noStudentsLinkedDesc")}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-medium text-slate-500">{t("children")}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {children.length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-medium text-slate-500">{t("outstandingInvoices")}</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{outstanding}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-medium text-slate-500">{t("quickLinks")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link href="/parent/fees">
                  <Button size="sm" variant="outline">{t("fees")}</Button>
                </Link>
                <Link href="/parent/performance">
                  <Button size="sm" variant="outline">{t("performance")}</Button>
                </Link>
                <Link href="/parent/timetable">
                  <Button size="sm" variant="outline">{t("timetable")}</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("yourChildren")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-base font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                        {child.first_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {child.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {child.class_name ?? t("noClass")}
                        </p>
                      </div>
                    </div>
                  </div>
                  {child.student_id && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs text-slate-500">{t("studentId")}</p>
                      <CopyableBadge value={child.student_id} label={child.student_id} />
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/parent/performance/${child.id}`}>
                      <Button size="sm" variant="ghost">{t("performance")}</Button>
                    </Link>
                    <Link href="/parent/timetable">
                      <Button size="sm" variant="ghost">{t("timetable")}</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {childPreviews.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {t("todaysSnapshot")}
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {childPreviews.map(({ child, todaySlots, upcoming }) => (
                  <div
                    key={child.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{child.name}</p>
                    <p className="text-xs text-slate-500">{format(new Date(), "EEEE, MMM d")}</p>
                    {todaySlots.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-500">{t("noClassesToday")}</p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {todaySlots.slice(0, 4).map((slot) => (
                          <li
                            key={slot.id}
                            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50"
                          >
                            <span className="font-medium">{slot.subject_name ?? "—"}</span>
                            <span className="text-xs text-slate-500">P{slot.period}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {upcoming.length > 0 && (
                      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <p className="text-xs font-medium text-slate-500">{t("dueSoon")}</p>
                        <ul className="mt-2 space-y-1">
                          {upcoming.map((a) => (
                            <li key={a.id} className="text-sm text-slate-700 dark:text-slate-300">
                              {a.title}
                              {a.due_date && (
                                <span className="ml-2 text-xs text-slate-400">
                                  {format(new Date(a.due_date), "MMM d")}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
