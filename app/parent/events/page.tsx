import { format } from "date-fns";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getGuardianByAuthUserId,
  getLinkedStudentsForGuardian,
  getEvents,
} from "@/lib/db";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ParentEventsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title="Not signed in" description="Please log in to view events." />
    );
  }

  const guardian = await getGuardianByAuthUserId(profile.id);
  if (!guardian) {
    return (
      <EmptyState
        title="No guardian profile"
        description="Your account is not linked to a guardian profile."
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Events & Holidays
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Upcoming school calendar (read-only).
        </p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="No upcoming events"
          description="There are no scheduled events or holidays on the calendar."
        />
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                <span className="text-xs font-medium">
                  {format(new Date(event.date), "MMM")}
                </span>
                <span className="text-lg font-bold leading-none">
                  {format(new Date(event.date), "d")}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {event.title}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      event.type === "holiday"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {event.type === "holiday" ? "Holiday" : "Event"}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                </p>
                {event.description && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
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
