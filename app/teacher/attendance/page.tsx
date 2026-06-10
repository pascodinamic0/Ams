import { Suspense } from "react";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTeacherClasses, getAttendanceForClass } from "@/lib/db";
import { AttendanceSheet } from "./attendance-sheet";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; date?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return <p className="text-sm text-slate-500">Please sign in to take attendance.</p>;
  }

  const params = await searchParams;
  const classes = await getTeacherClasses(profile.id);

  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <EmptyState
          title="No classes assigned"
          description="You need timetable assignments before taking attendance."
        />
      </div>
    );
  }

  const classId = params.class && classes.some((c) => c.id === params.class)
    ? params.class
    : classes[0].id;
  const date = params.date ?? format(new Date(), "yyyy-MM-dd");
  const records = await getAttendanceForClass(classId, date);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>
      <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
        <AttendanceSheet
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
          initialClassId={classId}
          initialDate={date}
          records={records}
        />
      </Suspense>
    </div>
  );
}
