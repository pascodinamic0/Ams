import { getCurrentProfile } from "@/lib/auth/session";
import { getStudentByAuthUserId, getTimetableForClass } from "@/lib/db";
import { TimetableView } from "@/components/portal/timetable-view";
import { EmptyState } from "@/components/ui/empty-state";

export default async function StudentTimetablePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title="Not signed in" description="Please log in to view your timetable." />
    );
  }

  const student = await getStudentByAuthUserId(profile.id);
  if (!student) {
    return (
      <EmptyState
        title="No student profile"
        description="Your account is not linked to a student record."
      />
    );
  }

  const slots = student.class_id ? await getTimetableForClass(student.class_id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Timetable</h1>
        <p className="mt-1 text-sm text-slate-500">
          {student.class_name
            ? `Weekly schedule for ${student.class_name}`
            : "Your weekly class schedule (read-only)."}
        </p>
      </div>

      {!student.class_id ? (
        <EmptyState
          title="No class assigned"
          description="You are not assigned to a class yet. Contact the school."
        />
      ) : (
        <TimetableView slots={slots} />
      )}
    </div>
  );
}
