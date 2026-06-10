import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTeacherClasses } from "@/lib/db";
import { getStudents } from "@/lib/db/students";

export default async function TeacherClassesPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return <p className="text-sm text-slate-500">Please sign in to view your classes.</p>;
  }

  const classes = await getTeacherClasses(profile.id);

  const studentsByClass = await Promise.all(
    classes.map(async (cls) => ({
      classId: cls.id,
      students: await getStudents({ classId: cls.id, status: "active" }),
    }))
  );

  const studentMap = Object.fromEntries(
    studentsByClass.map(({ classId, students }) => [classId, students])
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Classes</h1>

      {classes.length === 0 ? (
        <EmptyState
          title="No classes assigned"
          description="Classes appear here when you are assigned in the timetable."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {classes.map((cls) => {
            const students = studentMap[cls.id] ?? [];
            return (
              <Card key={cls.id}>
                <CardHeader>
                  <CardTitle>{cls.name}</CardTitle>
                  <p className="text-sm font-normal text-slate-500">
                    {cls.grade ? `Grade ${cls.grade}` : ""}
                    {cls.section_name ? ` · ${cls.section_name}` : ""}
                    {" · "}
                    {students.length} student{students.length !== 1 ? "s" : ""}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {students.length > 0 ? (
                    <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                      {students.map((s) => (
                        <li
                          key={s.id}
                          className="flex justify-between rounded px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <span>{s.name}</span>
                          <span className="text-slate-500">{s.student_id ?? "—"}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">No active students in this class.</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/teacher/attendance?class=${cls.id}`}>
                      <Button size="sm" variant="outline">Attendance</Button>
                    </Link>
                    <Link href={`/teacher/gradebook?class=${cls.id}`}>
                      <Button size="sm" variant="outline">Gradebook</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
