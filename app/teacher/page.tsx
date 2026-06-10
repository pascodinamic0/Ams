import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTeacherClasses, getTeacherTodaySchedule } from "@/lib/db";

export default async function TeacherDashboard() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return <p className="text-sm text-slate-500">Please sign in to view your dashboard.</p>;
  }

  const [classes, schedule] = await Promise.all([
    getTeacherClasses(profile.id),
    getTeacherTodaySchedule(profile.id),
  ]);

  const todayLabel = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        {profile.name && (
          <p className="mt-1 text-sm text-slate-500">Welcome back, {profile.name}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{classes.length}</p>
            <p className="text-sm text-slate-500">
              {classes.reduce((sum, c) => sum + c.student_count, 0)} students total
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <p className="text-sm font-normal text-slate-500">{todayLabel}</p>
          </CardHeader>
          <CardContent>
            {schedule.length === 0 ? (
              <p className="text-sm text-slate-500">No classes scheduled for today.</p>
            ) : (
              <ul className="space-y-2">
                {schedule.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm dark:border-slate-700"
                  >
                    <span className="font-medium">Period {slot.period}</span>
                    <span>{slot.class_name}</span>
                    <span className="text-slate-500">{slot.subject_name ?? "—"}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link href="/teacher/attendance">
              <Button size="sm" className="w-full">Take attendance</Button>
            </Link>
            <Link href="/teacher/gradebook">
              <Button size="sm" variant="outline" className="w-full">Enter grades</Button>
            </Link>
            <Link href="/teacher/assignments">
              <Button size="sm" variant="ghost" className="w-full">Manage assignments</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
