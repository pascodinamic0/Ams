import { getCurrentProfile } from "@/lib/auth/session";
import {
  getGuardianByAuthUserId,
  getLinkedStudentsForGuardian,
  getTimetableForClass,
} from "@/lib/db";
import { TimetableView } from "@/components/portal/timetable-view";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ParentTimetablePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title="Not signed in" description="Please log in to view timetables." />
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

  const timetables = await Promise.all(
    children.map(async (child) => ({
      child,
      slots: child.class_id ? await getTimetableForClass(child.class_id) : [],
    }))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Timetable</h1>
        <p className="mt-1 text-sm text-slate-500">
          Weekly class schedules for your children (read-only).
        </p>
      </div>

      {children.length === 0 ? (
        <EmptyState
          title="No students linked"
          description="Contact the school to link your children to your account."
        />
      ) : (
        <div className="space-y-10">
          {timetables.map(({ child, slots }) => (
            <div key={child.id}>
              {!child.class_id ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="font-semibold text-slate-900 dark:text-white">{child.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">Not assigned to a class yet.</p>
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
