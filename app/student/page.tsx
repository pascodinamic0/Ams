import Link from "next/link";
import { format } from "date-fns";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getStudentByAuthUserId,
  getTodaysTimetableForClass,
  getUpcomingAssignmentsForStudent,
  getEvents,
} from "@/lib/db";
import { CopyableBadge } from "@/components/ui/copyable-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default async function StudentDashboard() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState
        title="Not signed in"
        description="Please log in to view your student dashboard."
      />
    );
  }

  const student = await getStudentByAuthUserId(profile.id);

  if (!student) {
    return (
      <EmptyState
        title="No student profile"
        description="Your account is not linked to a student record. Contact the school."
      />
    );
  }

  const [todaySlots, upcoming, events] = await Promise.all([
    student.class_id ? getTodaysTimetableForClass(student.class_id) : Promise.resolve([]),
    getUpcomingAssignmentsForStudent(student.id, 5),
    getEvents({
      branchId: student.branch_id,
      fromDate: format(new Date(), "yyyy-MM-dd"),
      limit: 3,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome, {student.first_name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {student.class_name ?? "No class assigned"}
          </p>
        </div>
        {student.student_id && (
          <div>
            <p className="mb-1 text-xs text-slate-500">Your Student ID</p>
            <CopyableBadge value={student.student_id} label={student.student_id} variant="button" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/student/timetable"><Button size="sm" variant="outline">Timetable</Button></Link>
        <Link href="/student/assignments"><Button size="sm" variant="outline">Assignments</Button></Link>
        <Link href="/student/grades"><Button size="sm" variant="outline">Grades</Button></Link>
        <Link href="/student/library"><Button size="sm" variant="outline">Library</Button></Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Today&apos;s schedule</h2>
          <p className="text-xs text-slate-500">{format(new Date(), "EEEE, MMMM d")}</p>
          {todaySlots.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              {new Date().getDay() === 0 || new Date().getDay() === 6
                ? "No classes on weekends."
                : "No classes scheduled today."}
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {todaySlots.map((slot) => (
                <li
                  key={slot.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {slot.subject_name ?? "—"}
                    </p>
                    {slot.teacher_name && (
                      <p className="text-xs text-slate-500">{slot.teacher_name}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">Period {slot.period}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Assignments due</h2>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No upcoming assignments.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {upcoming.map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{a.title}</p>
                  <p className="text-xs text-slate-500">
                    Due {a.due_date ? format(new Date(a.due_date), "MMM d, yyyy") : "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/student/assignments" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
            View all assignments →
          </Link>
        </div>
      </div>

      {events.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Upcoming events</h2>
            <Link href="/student/events" className="text-sm text-indigo-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="space-y-2">
            {events.map((e) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900 dark:text-white">{e.title}</span>
                <span className="text-slate-500">{format(new Date(e.date), "MMM d")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
