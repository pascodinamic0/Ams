import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns";
import { Chart } from "@/components/ui/chart";

interface PageProps {
  params: Promise<{ studentId: string }>;
}

async function getStudentPerformanceData(studentId: string) {
  const supabase = await createClient();

  type StudentRow = {
    id: string; first_name: string; last_name: string;
    student_id: string; class_id: string | null;
    classes: { name: string } | null;
  };
  type GradeRow = { id: string; marks: number | null; grade: string | null; term: string; subjects: { name: string } | null };
  type AttendanceRow = { id: string; date: string; status: string };
  type AssignmentRow = { id: string; grade: number | null; submitted_at: string | null; assignments: { title: string; due_date: string | null; subjects: { name: string } | null } | null };

  const [
    { data: studentRaw },
    { data: gradesRaw },
    { data: attendanceRaw },
    { data: assignmentsRaw },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id, first_name, last_name, student_id, class_id, classes(name)")
      .eq("id", studentId)
      .single(),
    supabase
      .from("grades")
      .select("id, marks, grade, term, subjects(name)")
      .eq("student_id", studentId)
      .order("term"),
    supabase
      .from("attendance_records")
      .select("id, date, status")
      .eq("student_id", studentId)
      .order("date", { ascending: false })
      .limit(90),
    supabase
      .from("assignment_submissions")
      .select("id, grade, submitted_at, assignments(title, due_date, subjects(name))")
      .eq("student_id", studentId)
      .order("submitted_at", { ascending: false })
      .limit(20),
  ]);

  const student = studentRaw as unknown as StudentRow | null;
  const grades = (gradesRaw ?? []) as unknown as GradeRow[];
  const attendance = (attendanceRaw ?? []) as unknown as AttendanceRow[];
  const assignments = (assignmentsRaw ?? []) as unknown as AssignmentRow[];

  return { student, grades, attendance, assignments };
}

type TimetableSlot = { id: string; period: number; subjects: { name: string } | null; profiles: { name: string } | null };

async function getTodaysTimetable(classId: string): Promise<TimetableSlot[]> {
  const supabase = await createClient();
  const dayOfWeek = new Date().getDay();

  const { data } = await supabase
    .from("timetable_slots")
    .select("id, period, subjects(name), profiles(name)")
    .eq("class_id", classId)
    .eq("day", dayOfWeek)
    .order("period");

  return (data ?? []) as unknown as TimetableSlot[];
}

export default async function ChildPerformancePage({ params }: PageProps) {
  const { studentId } = await params;
  const { student, grades, attendance, assignments } = await getStudentPerformanceData(studentId);


  if (!student) notFound();

  const classData = student.classes as { name: string } | null;

  // Get today's timetable
  const todaysSlots = student.class_id ? await getTodaysTimetable(student.class_id) : [];

  // ── Grade chart data (by subject, latest marks)
  const subjectGradeMap: Record<string, number[]> = {};
  for (const g of grades) {
    const subj = g.subjects?.name ?? "Unknown";
    if (!subjectGradeMap[subj]) subjectGradeMap[subj] = [];
    if (g.marks !== null) subjectGradeMap[subj].push(Number(g.marks));
  }
  const gradeChartData = Object.entries(subjectGradeMap).map(([name, marks]) => ({
    name,
    average: Math.round(marks.reduce((s, m) => s + m, 0) / marks.length),
  }));

  // ── Attendance chart: last 4 weeks (Mon–Fri)
  const today = new Date();
  const weekStarts = [0, 1, 2, 3].map((w) =>
    startOfWeek(new Date(today.getFullYear(), today.getMonth(), today.getDate() - w * 7), {
      weekStartsOn: 1,
    })
  ).reverse();

  const attendanceChartData = weekStarts.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd }).filter(
      (d) => d.getDay() >= 1 && d.getDay() <= 5
    );
    const weekLabel = format(weekStart, "MMM d");
    let present = 0;
    let absent = 0;
    for (const day of weekDays) {
      const dayStr = format(day, "yyyy-MM-dd");
      const record = attendance.find((a) => a.date === dayStr);
      if (record?.status === "present") present++;
      else if (record?.status === "absent") absent++;
    }
    return { name: weekLabel, Present: present, Absent: absent };
  });

  // ── Attendance summary
  const totalDays = attendance.length;
  const presentDays = attendance.filter((a) => a.status === "present").length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // ── Assignment completion
  const submittedCount = assignments.filter((a) => a.submitted_at).length;
  const avgAssignmentGrade =
    assignments.filter((a) => a.grade !== null).length > 0
      ? Math.round(
          assignments.reduce((s, a) => s + (a.grade ? Number(a.grade) : 0), 0) /
            assignments.filter((a) => a.grade !== null).length
        )
      : null;

  const studentName = `${student.first_name} ${student.last_name}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{studentName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {classData?.name ?? "No class"} · ID: {student.student_id}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900/30">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">Active</span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Attendance Rate",
            value: `${attendanceRate}%`,
            sub: `${presentDays}/${totalDays} days`,
            color: attendanceRate >= 80 ? "text-green-600" : "text-red-500",
          },
          {
            label: "Subjects",
            value: gradeChartData.length,
            sub: "being graded",
            color: "text-indigo-600",
          },
          {
            label: "Assignments",
            value: submittedCount,
            sub: `of ${assignments.length} submitted`,
            color: "text-amber-600",
          },
          {
            label: "Avg Grade",
            value: avgAssignmentGrade !== null ? `${avgAssignmentGrade}%` : "—",
            sub: "across assignments",
            color: "text-slate-700 dark:text-slate-200",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Today's learning tracker */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
            <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Today&apos;s Schedule
            </h2>
            <p className="text-xs text-slate-500">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          </div>
        </div>

        {todaysSlots.length === 0 ? (
          <div className="rounded-lg bg-slate-50 p-6 text-center dark:bg-slate-800/50">
            <p className="text-sm text-slate-500">
              {new Date().getDay() === 0 || new Date().getDay() === 6
                ? "No classes on weekends"
                : "No timetable set up yet for today"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todaysSlots.map((slot, idx) => {
                  const subject = slot.subjects?.name ?? "Unknown";
                  const teacher = slot.profiles?.name ?? "—";
              return (
                <div
                  key={slot.id}
                  className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{subject}</p>
                    <p className="text-xs text-slate-500">Period {slot.period} · {teacher}</p>
                  </div>
                  {isToday(new Date()) && idx === 0 && (
                    <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Now
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Grade performance by subject */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-1 font-semibold text-slate-900 dark:text-white">Grade by Subject</h2>
          <p className="mb-4 text-xs text-slate-500">Average score across all terms</p>
          {gradeChartData.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <p className="text-sm text-slate-400">No grades recorded yet</p>
            </div>
          ) : (
            <Chart
              type="bar"
              data={gradeChartData}
              yKey="average"
              height={220}
            />
          )}
        </div>

        {/* Attendance pattern */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-1 font-semibold text-slate-900 dark:text-white">Attendance Pattern</h2>
          <p className="mb-4 text-xs text-slate-500">Last 4 weeks (Mon–Fri)</p>
          <Chart
            type="bar"
            data={attendanceChartData}
            yKeys={["Present", "Absent"]}
            height={220}
          />
        </div>
      </div>

      {/* Recent assignments */}
      {assignments.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Recent Assignments</h2>
          <div className="space-y-2">
            {assignments.slice(0, 8).map((sub) => {
              const asgn = sub.assignments;
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {asgn?.title ?? "Assignment"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {asgn?.subjects?.name ?? "—"} ·{" "}
                      {sub.submitted_at
                        ? `Submitted ${format(new Date(sub.submitted_at), "MMM d")}`
                        : "Not submitted"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.grade !== null ? (
                      <span className={`text-sm font-semibold ${Number(sub.grade) >= 70 ? "text-green-600" : Number(sub.grade) >= 50 ? "text-amber-600" : "text-red-500"}`}>
                        {sub.grade}%
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Not graded</span>
                    )}
                    {sub.submitted_at ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">Done</span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
