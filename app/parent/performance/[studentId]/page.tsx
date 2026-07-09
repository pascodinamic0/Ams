import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from "date-fns";
import { Chart } from "@/components/ui/chart-lazy";
import { getTranslations } from "next-intl/server";

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
  const t = await getTranslations("parent");
  const tc = await getTranslations("common");
  const { studentId } = await params;
  const { student, grades, attendance, assignments } = await getStudentPerformanceData(studentId);

  if (!student) notFound();

  const classData = student.classes as { name: string } | null;
  const presentKey = t("chartPresent");
  const absentKey = t("chartAbsent");

  const todaysSlots = student.class_id ? await getTodaysTimetable(student.class_id) : [];

  const subjectGradeMap: Record<string, number[]> = {};
  for (const g of grades) {
    const subj = g.subjects?.name ?? t("unknownSubject");
    if (!subjectGradeMap[subj]) subjectGradeMap[subj] = [];
    if (g.marks !== null) subjectGradeMap[subj].push(Number(g.marks));
  }
  const gradeChartData = Object.entries(subjectGradeMap).map(([name, marks]) => ({
    name,
    average: Math.round(marks.reduce((s, m) => s + m, 0) / marks.length),
  }));

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
    return { name: weekLabel, [presentKey]: present, [absentKey]: absent };
  });

  const totalDays = attendance.length;
  const presentDays = attendance.filter((a) => a.status === "present").length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const submittedCount = assignments.filter((a) => a.submitted_at).length;
  const avgAssignmentGrade =
    assignments.filter((a) => a.grade !== null).length > 0
      ? Math.round(
          assignments.reduce((s, a) => s + (a.grade ? Number(a.grade) : 0), 0) /
            assignments.filter((a) => a.grade !== null).length
        )
      : null;

  const studentName = `${student.first_name} ${student.last_name}`;

  const kpiCards = [
    {
      label: t("attendanceRate"),
      value: `${attendanceRate}%`,
      sub: t("daysCount", { present: presentDays, total: totalDays }),
      color: attendanceRate >= 80 ? "text-green-600" : "text-red-500",
    },
    {
      label: t("subjects"),
      value: gradeChartData.length,
      sub: t("beingGraded"),
      color: "text-primary",
    },
    {
      label: t("assignments"),
      value: submittedCount,
      sub: t("ofSubmitted", { total: assignments.length }),
      color: "text-amber-600",
    },
    {
      label: t("avgGrade"),
      value: avgAssignmentGrade !== null ? `${avgAssignmentGrade}%` : "—",
      sub: t("acrossAssignments"),
      color: "text-stone-700 dark:text-stone-200",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{studentName}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {classData?.name ?? t("noClass")} · {t("idLabel", { id: student.student_id })}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900/30">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-green-700 dark:text-green-400">{tc("active")}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900"
          >
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-stone-400">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light dark:bg-primary-light/40">
            <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-stone-900 dark:text-white">{t("todaysSchedule")}</h2>
            <p className="text-xs text-stone-500">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          </div>
        </div>

        {todaysSlots.length === 0 ? (
          <div className="rounded-lg bg-stone-50 p-6 text-center dark:bg-stone-800/50">
            <p className="text-sm text-stone-500">
              {new Date().getDay() === 0 || new Date().getDay() === 6
                ? t("noClassesWeekend")
                : t("noTimetableToday")}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todaysSlots.map((slot, idx) => {
              const subject = slot.subjects?.name ?? t("unknownSubject");
              const teacher = slot.profiles?.name ?? "—";
              return (
                <div
                  key={slot.id}
                  className="flex items-center gap-4 rounded-lg border border-stone-100 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-800/50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary-hover dark:bg-primary-light/50 dark:text-primary">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900 dark:text-white">{subject}</p>
                    <p className="text-xs text-stone-500">{t("periodWithTeacher", { period: slot.period, teacher })}</p>
                  </div>
                  {isToday(new Date()) && idx === 0 && (
                    <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {t("now")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <h2 className="mb-1 font-semibold text-stone-900 dark:text-white">{t("gradeBySubject")}</h2>
          <p className="mb-4 text-xs text-stone-500">{t("avgScoreAllTerms")}</p>
          {gradeChartData.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-lg bg-stone-50 dark:bg-stone-800/50">
              <p className="text-sm text-stone-400">{t("noGradesRecorded")}</p>
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

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <h2 className="mb-1 font-semibold text-stone-900 dark:text-white">{t("attendancePattern")}</h2>
          <p className="mb-4 text-xs text-stone-500">{t("last4Weeks")}</p>
          <Chart
            type="bar"
            data={attendanceChartData}
            yKeys={[presentKey, absentKey]}
            height={220}
          />
        </div>
      </div>

      {assignments.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
          <h2 className="mb-4 font-semibold text-stone-900 dark:text-white">{t("recentAssignments")}</h2>
          <div className="space-y-2">
            {assignments.slice(0, 8).map((sub) => {
              const asgn = sub.assignments;
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-stone-100 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-800/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-900 dark:text-white">
                      {asgn?.title ?? t("assignmentFallback")}
                    </p>
                    <p className="text-xs text-stone-500">
                      {asgn?.subjects?.name ?? "—"} ·{" "}
                      {sub.submitted_at
                        ? t("submittedOn", { date: format(new Date(sub.submitted_at), "MMM d") })
                        : t("notSubmitted")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.grade !== null ? (
                      <span className={`text-sm font-semibold ${Number(sub.grade) >= 70 ? "text-green-600" : Number(sub.grade) >= 50 ? "text-amber-600" : "text-red-500"}`}>
                        {sub.grade}%
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400">{t("notGraded")}</span>
                    )}
                    {sub.submitted_at ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">{t("done")}</span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">{t("statusPending")}</span>
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
