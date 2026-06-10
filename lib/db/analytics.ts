import { format, subDays, endOfWeek, eachWeekOfInterval, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getFinanceKPIs } from "./invoices";

export type ChartPoint = { name: string; value: number };
export type MultiChartPoint = Record<string, string | number>;

export type AnalyticsOverview = {
  totalStudents: number;
  activeStudents: number;
  attendanceRate: number;
  revenue: number;
  enrollmentByClass: ChartPoint[];
  attendanceTrend: ChartPoint[];
  genderDistribution: ChartPoint[];
  gradeDistribution: ChartPoint[];
};

export type BranchPerformanceRow = {
  id: string;
  name: string;
  school_name: string;
  students: number;
  attendance_rate: number;
  revenue: number;
};

export type StudentAnalyticsData = {
  studentsByClass: ChartPoint[];
  gradeTrend: MultiChartPoint[];
  subjectPerformance: ChartPoint[];
  topPerformers: { name: string; student_id: string; average: number }[];
  bottomPerformers: { name: string; student_id: string; average: number }[];
  passFailByClass: MultiChartPoint[];
};

export type AttendanceAnalyticsData = {
  dailyAttendance: ChartPoint[];
  classAttendance: ChartPoint[];
  lowAttendanceStudents: {
    name: string;
    student_id: string;
    class_name: string;
    percentage: number;
  }[];
  overallRate: number;
};

export type FinanceAnalyticsData = {
  kpis: Awaited<ReturnType<typeof getFinanceKPIs>>;
  monthlyRevenue: MultiChartPoint[];
  feeStatusBreakdown: ChartPoint[];
  monthlyCollection: ChartPoint[];
  exportRows: Record<string, unknown>[];
};

type Scope = { schoolId?: string; branchId?: string };

function isOverdue(status: string, dueDate: string): boolean {
  if (status === "paid") return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

export async function getAnalyticsOverview(scope?: Scope): Promise<AnalyticsOverview> {
  const supabase = await createClient();

  let studentsQuery = supabase.from("students").select("id, status, gender, class_id, classes(name, grade)");
  if (scope?.schoolId) studentsQuery = studentsQuery.eq("school_id", scope.schoolId);
  if (scope?.branchId) studentsQuery = studentsQuery.eq("branch_id", scope.branchId);

  const startDate = format(subDays(new Date(), 27), "yyyy-MM-dd");
  let attendanceQuery = supabase
    .from("attendance_records")
    .select("status, date, student_id, students(school_id, branch_id)")
    .gte("date", startDate);

  const [studentsResult, attendanceResult, financeKpis] = await Promise.all([
    studentsQuery,
    attendanceQuery,
    getFinanceKPIs(scope),
  ]);

  const students = studentsResult.data ?? [];
  const activeStudents = students.filter((s) => s.status === "active").length;

  let attendanceRecords = attendanceResult.data ?? [];
  if (scope?.schoolId || scope?.branchId) {
    attendanceRecords = attendanceRecords.filter((r) => {
      const student = r.students as { school_id?: string; branch_id?: string } | null;
      if (scope.schoolId && student?.school_id !== scope.schoolId) return false;
      if (scope.branchId && student?.branch_id !== scope.branchId) return false;
      return true;
    });
  }

  const present = attendanceRecords.filter((r) => r.status === "present").length;
  const totalAttendance = attendanceRecords.length;
  const attendanceRate = totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 0;

  const classCounts: Record<string, number> = {};
  for (const s of students.filter((st) => st.status === "active")) {
    const className = (s.classes as { name?: string } | null)?.name ?? "Unassigned";
    classCounts[className] = (classCounts[className] ?? 0) + 1;
  }
  const enrollmentByClass = Object.entries(classCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const genderCounts: Record<string, number> = {};
  for (const s of students) {
    const gender = (s.gender as string) || "Not specified";
    const label = gender.charAt(0).toUpperCase() + gender.slice(1);
    genderCounts[label] = (genderCounts[label] ?? 0) + 1;
  }
  const genderDistribution = Object.entries(genderCounts).map(([name, value]) => ({ name, value }));

  const gradeCounts: Record<string, number> = {};
  for (const s of students.filter((st) => st.status === "active")) {
    const grade = (s.classes as { grade?: string } | null)?.grade ?? "Unassigned";
    gradeCounts[grade] = (gradeCounts[grade] ?? 0) + 1;
  }
  const gradeDistribution = Object.entries(gradeCounts).map(([name, value]) => ({ name, value }));

  const weeks = eachWeekOfInterval({
    start: subDays(new Date(), 27),
    end: new Date(),
  });
  const attendanceTrend = weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart);
    const weekRecords = attendanceRecords.filter((r) => {
      const d = parseISO(r.date);
      return d >= weekStart && d <= weekEnd;
    });
    const weekPresent = weekRecords.filter((r) => r.status === "present").length;
    const rate = weekRecords.length > 0 ? Math.round((weekPresent / weekRecords.length) * 100) : 0;
    return { name: format(weekStart, "MMM d"), value: rate };
  });

  return {
    totalStudents: students.length,
    activeStudents,
    attendanceRate,
    revenue: financeKpis.collected,
    enrollmentByClass: enrollmentByClass.length ? enrollmentByClass : [{ name: "No data", value: 0 }],
    attendanceTrend: attendanceTrend.length ? attendanceTrend : [{ name: "No data", value: 0 }],
    genderDistribution: genderDistribution.length ? genderDistribution : [{ name: "No data", value: 0 }],
    gradeDistribution: gradeDistribution.length ? gradeDistribution : [{ name: "No data", value: 0 }],
  };
}

export async function getBranchAnalytics(scope?: Scope): Promise<BranchPerformanceRow[]> {
  const supabase = await createClient();

  let branchesQuery = supabase
    .from("branches")
    .select("id, name, school_id, schools(name)")
    .order("name");
  if (scope?.schoolId) branchesQuery = branchesQuery.eq("school_id", scope.schoolId);
  if (scope?.branchId) branchesQuery = branchesQuery.eq("id", scope.branchId);

  let studentsQuery = supabase.from("students").select("id, branch_id, status");
  if (scope?.schoolId) studentsQuery = studentsQuery.eq("school_id", scope.schoolId);
  if (scope?.branchId) studentsQuery = studentsQuery.eq("branch_id", scope.branchId);

  const [branchesResult, studentsResult, attendanceResult, invoicesResult] = await Promise.all([
    branchesQuery,
    studentsQuery,
    supabase.from("attendance_records").select("status, student_id, students(branch_id, school_id)"),
    supabase
      .from("fee_invoices")
      .select("amount_paid, students(branch_id, school_id)"),
  ]);

  const branches = branchesResult.data ?? [];
  const students = studentsResult.data ?? [];
  const attendance = attendanceResult.data ?? [];
  const invoices = invoicesResult.data ?? [];

  return branches.map((branch) => {
    const branchStudents = students.filter(
      (s) => s.branch_id === branch.id && s.status === "active"
    );
    const studentIds = new Set(branchStudents.map((s) => s.id));

    const branchAttendance = attendance.filter((r) => {
      const sid = r.student_id;
      if (studentIds.has(sid)) return true;
      const student = r.students as { branch_id?: string } | null;
      return student?.branch_id === branch.id;
    });
    const present = branchAttendance.filter((r) => r.status === "present").length;
    const attendanceRate =
      branchAttendance.length > 0 ? Math.round((present / branchAttendance.length) * 100) : 0;

    const revenue = invoices
      .filter((inv) => {
        const student = inv.students as { branch_id?: string } | null;
        return student?.branch_id === branch.id;
      })
      .reduce((sum, inv) => sum + Number(inv.amount_paid ?? 0), 0);

    return {
      id: branch.id,
      name: branch.name,
      school_name: (branch.schools as { name?: string } | null)?.name ?? "-",
      students: branchStudents.length,
      attendance_rate: attendanceRate,
      revenue,
    };
  });
}

export async function getStudentAnalytics(options?: Scope & { classId?: string }): Promise<StudentAnalyticsData> {
  const supabase = await createClient();

  let studentsQuery = supabase
    .from("students")
    .select("id, first_name, last_name, student_id, class_id, status, classes(name)")
    .eq("status", "active");
  if (options?.schoolId) studentsQuery = studentsQuery.eq("school_id", options.schoolId);
  if (options?.branchId) studentsQuery = studentsQuery.eq("branch_id", options.branchId);
  if (options?.classId) studentsQuery = studentsQuery.eq("class_id", options.classId);

  const [studentsResult, gradesResult] = await Promise.all([
    studentsQuery,
    supabase.from("grades").select("student_id, term, marks, grade, subject_id, class_id, subjects(name), students(school_id, branch_id)"),
  ]);

  const students = studentsResult.data ?? [];
  let grades = gradesResult.data ?? [];

  if (options?.schoolId || options?.branchId || options?.classId) {
    grades = grades.filter((g) => {
      const student = g.students as { school_id?: string; branch_id?: string } | null;
      if (options?.schoolId && student?.school_id !== options.schoolId) return false;
      if (options?.branchId && student?.branch_id !== options.branchId) return false;
      if (options?.classId && g.class_id !== options.classId) return false;
      return true;
    });
  }

  const studentsByClass: Record<string, number> = {};
  for (const s of students) {
    const className = (s.classes as { name?: string } | null)?.name ?? "Unassigned";
    studentsByClass[className] = (studentsByClass[className] ?? 0) + 1;
  }

  const termAverages: Record<string, { sum: number; count: number }> = {};
  for (const g of grades) {
    if (g.marks === null) continue;
    const term = g.term;
    if (!termAverages[term]) termAverages[term] = { sum: 0, count: 0 };
    termAverages[term].sum += Number(g.marks);
    termAverages[term].count += 1;
  }
  const gradeTrend = Object.entries(termAverages)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([term, { sum, count }]) => ({
      name: term,
      average: count > 0 ? Math.round(sum / count) : 0,
    }));

  const subjectTotals: Record<string, { sum: number; count: number }> = {};
  for (const g of grades) {
    if (g.marks === null) continue;
    const subject = (g.subjects as { name?: string } | null)?.name ?? "Subject";
    if (!subjectTotals[subject]) subjectTotals[subject] = { sum: 0, count: 0 };
    subjectTotals[subject].sum += Number(g.marks);
    subjectTotals[subject].count += 1;
  }
  const subjectPerformance = Object.entries(subjectTotals)
    .map(([name, { sum, count }]) => ({ name, value: count > 0 ? Math.round(sum / count) : 0 }))
    .sort((a, b) => b.value - a.value);

  const studentAverages: { id: string; name: string; student_id: string; average: number }[] = [];
  const byStudent: Record<string, { name: string; student_id: string; sum: number; count: number }> = {};
  for (const g of grades) {
    if (g.marks === null) continue;
    const student = students.find((s) => s.id === g.student_id);
    const name = student ? `${student.first_name} ${student.last_name}` : "Student";
    const code = student?.student_id ?? "-";
    if (!byStudent[g.student_id]) byStudent[g.student_id] = { name, student_id: code, sum: 0, count: 0 };
    byStudent[g.student_id].sum += Number(g.marks);
    byStudent[g.student_id].count += 1;
  }
  for (const [id, { name, student_id, sum, count }] of Object.entries(byStudent)) {
    studentAverages.push({ id, name, student_id, average: count > 0 ? Math.round(sum / count) : 0 });
  }
  const sorted = [...studentAverages].sort((a, b) => b.average - a.average);
  const topPerformers = sorted.slice(0, 5).map(({ name, student_id, average }) => ({
    name,
    student_id,
    average,
  }));
  const bottomPerformers = [...sorted].reverse().slice(0, 5).map(({ name, student_id, average }) => ({
    name,
    student_id,
    average,
  }));

  const passFailByClass: Record<string, { pass: number; fail: number }> = {};
  for (const g of grades) {
    if (g.marks === null) continue;
    const student = students.find((s) => s.id === g.student_id);
    const className = (student?.classes as { name?: string } | null)?.name ?? "Unassigned";
    if (!passFailByClass[className]) passFailByClass[className] = { pass: 0, fail: 0 };
    if (Number(g.marks) >= 50) passFailByClass[className].pass += 1;
    else passFailByClass[className].fail += 1;
  }
  const passFailRows = Object.entries(passFailByClass).map(([name, { pass, fail }]) => ({
    name,
    pass,
    fail,
  }));

  return {
    studentsByClass: Object.entries(studentsByClass).map(([name, value]) => ({ name, value })),
    gradeTrend,
    subjectPerformance,
    topPerformers,
    bottomPerformers,
    passFailByClass: passFailRows,
  };
}

export async function getAttendanceAnalytics(options?: Scope & {
  startDate?: string;
  endDate?: string;
}): Promise<AttendanceAnalyticsData> {
  const supabase = await createClient();
  const endDate = options?.endDate ?? format(new Date(), "yyyy-MM-dd");
  const startDate = options?.startDate ?? format(subDays(parseISO(endDate), 29), "yyyy-MM-dd");

  let activeStudentsQuery = supabase
    .from("students")
    .select("id, first_name, last_name, student_id, class_id, classes(name)")
    .eq("status", "active");
  if (options?.schoolId) activeStudentsQuery = activeStudentsQuery.eq("school_id", options.schoolId);
  if (options?.branchId) activeStudentsQuery = activeStudentsQuery.eq("branch_id", options.branchId);

  const [attendanceResult, studentsResult, classesResult] = await Promise.all([
    supabase
      .from("attendance_records")
      .select("status, date, student_id, students(first_name, last_name, student_id, class_id, school_id, branch_id, classes(name))")
      .gte("date", startDate)
      .lte("date", endDate),
    activeStudentsQuery,
    supabase.from("classes").select("id, name"),
  ]);

  let records = attendanceResult.data ?? [];
  if (options?.schoolId || options?.branchId) {
    records = records.filter((r) => {
      const student = r.students as { school_id?: string; branch_id?: string } | null;
      if (options?.schoolId && student?.school_id !== options.schoolId) return false;
      if (options?.branchId && student?.branch_id !== options.branchId) return false;
      return true;
    });
  }

  const students = studentsResult.data ?? [];
  const classMap = new Map((classesResult.data ?? []).map((c) => [c.id, c.name]));

  const daily: Record<string, { present: number; total: number }> = {};
  for (const r of records) {
    if (!daily[r.date]) daily[r.date] = { present: 0, total: 0 };
    daily[r.date].total += 1;
    if (r.status === "present") daily[r.date].present += 1;
  }
  const dailyAttendance = Object.entries(daily)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { present, total }]) => ({
      name: format(parseISO(date), "MMM d"),
      value: total > 0 ? Math.round((present / total) * 100) : 0,
    }));

  const classStats: Record<string, { present: number; total: number }> = {};
  for (const r of records) {
    const student = r.students as { class_id?: string; classes?: { name?: string } } | null;
    const className = student?.classes?.name ?? classMap.get(student?.class_id ?? "") ?? "Unassigned";
    if (!classStats[className]) classStats[className] = { present: 0, total: 0 };
    classStats[className].total += 1;
    if (r.status === "present") classStats[className].present += 1;
  }
  const classAttendance = Object.entries(classStats).map(([name, { present, total }]) => ({
    name,
    value: total > 0 ? Math.round((present / total) * 100) : 0,
  }));

  const studentStats: Record<string, { present: number; absent: number; name: string; student_id: string; class_name: string }> = {};
  for (const r of records) {
    const student = r.students as {
      first_name?: string;
      last_name?: string;
      student_id?: string;
      classes?: { name?: string };
    } | null;
    const name = student ? `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim() : "Student";
    const code = student?.student_id ?? "-";
    const className = student?.classes?.name ?? "-";
    if (!studentStats[r.student_id]) {
      studentStats[r.student_id] = { present: 0, absent: 0, name, student_id: code, class_name: className };
    }
    if (r.status === "present") studentStats[r.student_id].present += 1;
    else studentStats[r.student_id].absent += 1;
  }

  const lowAttendanceStudents = Object.values(studentStats)
    .map((s) => {
      const total = s.present + s.absent;
      const percentage = total > 0 ? Math.round((s.present / total) * 100) : 100;
      return { ...s, percentage };
    })
    .filter((s) => s.percentage < 80 && s.present + s.absent >= 3)
    .sort((a, b) => a.percentage - b.percentage);

  const overallPresent = records.filter((r) => r.status === "present").length;
  const overallRate = records.length > 0 ? Math.round((overallPresent / records.length) * 100) : 0;

  return {
    dailyAttendance: dailyAttendance.length ? dailyAttendance : [{ name: "No data", value: 0 }],
    classAttendance: classAttendance.length ? classAttendance : [{ name: "No data", value: 0 }],
    lowAttendanceStudents,
    overallRate,
  };
}

export async function getFinanceAnalytics(scope?: Scope): Promise<FinanceAnalyticsData> {
  const supabase = await createClient();
  const kpis = await getFinanceKPIs(scope);

  const [paymentsResult, invoicesResult] = await Promise.all([
    supabase
      .from("fee_payments")
      .select("amount, paid_at, fee_invoices(students(school_id, branch_id))")
      .order("paid_at"),
    supabase
      .from("fee_invoices")
      .select("amount, amount_paid, due_date, status, students(school_id, branch_id)"),
  ]);

  let payments = paymentsResult.data ?? [];
  let invoices = invoicesResult.data ?? [];

  if (scope?.schoolId || scope?.branchId) {
    const matchesScope = (student: { school_id?: string; branch_id?: string } | null) => {
      if (scope?.schoolId && student?.school_id !== scope.schoolId) return false;
      if (scope?.branchId && student?.branch_id !== scope.branchId) return false;
      return true;
    };
    payments = payments.filter((p) => {
      const inv = p.fee_invoices as { students?: { school_id?: string; branch_id?: string } } | null;
      return matchesScope(inv?.students ?? null);
    });
    invoices = invoices.filter((inv) => matchesScope(inv.students as { school_id?: string; branch_id?: string } | null));
  }

  const monthlyRevenueMap: Record<string, number> = {};
  const monthlyCollectionMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const month = format(subDays(new Date(), i * 30), "MMM yyyy");
    monthlyRevenueMap[month] = 0;
    monthlyCollectionMap[month] = 0;
  }

  for (const p of payments) {
    const month = format(parseISO(p.paid_at), "MMM yyyy");
    monthlyCollectionMap[month] = (monthlyCollectionMap[month] ?? 0) + Number(p.amount);
    monthlyRevenueMap[month] = (monthlyRevenueMap[month] ?? 0) + Number(p.amount);
  }

  const monthlyRevenue = Object.entries(monthlyRevenueMap).map(([name, collected]) => ({
    name,
    collected,
    outstanding: Math.max(0, kpis.outstanding / 6),
  }));

  let paid = 0;
  let pending = 0;
  let overdue = 0;
  for (const inv of invoices) {
    const status = inv.status ?? "pending";
    const balance = Math.max(0, Number(inv.amount) - Number(inv.amount_paid ?? 0));
    if (status === "paid" || balance === 0) paid += 1;
    else if (isOverdue(status, inv.due_date)) overdue += 1;
    else pending += 1;
  }
  const feeStatusBreakdown = [
    { name: "Paid", value: paid },
    { name: "Pending", value: pending },
    { name: "Overdue", value: overdue },
  ];

  const monthlyCollection = Object.entries(monthlyCollectionMap).map(([name, value]) => ({
    name,
    value,
  }));

  const exportRows = monthlyCollection.map((row) => ({
    month: row.name,
    collected: row.value,
  }));

  return {
    kpis,
    monthlyRevenue,
    feeStatusBreakdown,
    monthlyCollection,
    exportRows,
  };
}
