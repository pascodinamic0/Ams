import { formatSchoolYearPeriod } from "@/lib/academic/school-year";
import { getAssignmentsForStudent, type StudentAssignmentItem } from "./assignments";
import {
  getStudentAttendanceHistory,
  getStudentAttendanceStats,
  type StudentAttendanceRecord,
} from "./attendance";
import { getGradesForStudent, type StudentGradeItem } from "./grades";
import { getInvoicesForStudent, type InvoiceListItem } from "./invoices";
import { getBookIssuesForStudent, type StudentBookIssueItem } from "./library";
import { getSchoolById, type SchoolRow } from "./schools";
import { getStudentById } from "./students";

export type StudentProfileStats = {
  attendancePercentage: number;
  attendancePresent: number;
  attendanceAbsent: number;
  attendanceTotal: number;
  averageMarks: number | null;
  gradeCount: number;
  subjectCount: number;
  outstandingFees: number;
  /** Display labels like "2026 - 2027 / T1" */
  terms: string[];
  schoolYears: number[];
};

export type StudentProfileBundle = {
  student: NonNullable<Awaited<ReturnType<typeof getStudentById>>>;
  school: SchoolRow | null;
  grades: StudentGradeItem[];
  gradesByTerm: Record<string, StudentGradeItem[]>;
  attendanceStats: Awaited<ReturnType<typeof getStudentAttendanceStats>>;
  attendanceHistory: StudentAttendanceRecord[];
  assignments: StudentAssignmentItem[];
  invoices: InvoiceListItem[];
  libraryIssues: StudentBookIssueItem[];
  stats: StudentProfileStats;
};

function computeStats(
  grades: StudentGradeItem[],
  attendance: Awaited<ReturnType<typeof getStudentAttendanceStats>>,
  invoices: InvoiceListItem[]
): StudentProfileStats {
  const marks = grades
    .map((g) => g.marks)
    .filter((m): m is number => m !== null && !Number.isNaN(m));
  const averageMarks =
    marks.length > 0
      ? Math.round(marks.reduce((sum, m) => sum + m, 0) / marks.length)
      : null;
  const subjects = new Set(grades.map((g) => g.subject_name));
  const terms = [
    ...new Set(
      grades.map((g) => formatSchoolYearPeriod(g.school_year, g.term))
    ),
  ].sort();
  const schoolYears = [...new Set(grades.map((g) => g.school_year))].sort(
    (a, b) => b - a
  );
  const outstandingFees = invoices.reduce((sum, inv) => sum + inv.balance, 0);

  return {
    attendancePercentage: attendance.percentage,
    attendancePresent: attendance.present,
    attendanceAbsent: attendance.absent,
    attendanceTotal: attendance.total,
    averageMarks,
    gradeCount: grades.length,
    subjectCount: subjects.size,
    outstandingFees,
    terms,
    schoolYears,
  };
}

function gradePeriodKey(grade: StudentGradeItem): string {
  return formatSchoolYearPeriod(grade.school_year, grade.term);
}

function groupGradesByTerm(grades: StudentGradeItem[]): Record<string, StudentGradeItem[]> {
  const grouped: Record<string, StudentGradeItem[]> = {};
  for (const grade of grades) {
    const key = gradePeriodKey(grade);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(grade);
  }
  return grouped;
}

export async function getStudentProfileBundle(
  studentId: string
): Promise<StudentProfileBundle | null> {
  const student = await getStudentById(studentId);
  if (!student) return null;

  const [grades, attendanceStats, attendanceHistory, assignments, invoices, libraryIssues, school] =
    await Promise.all([
      getGradesForStudent(studentId),
      getStudentAttendanceStats(studentId),
      getStudentAttendanceHistory(studentId, 60),
      getAssignmentsForStudent(studentId),
      getInvoicesForStudent(studentId),
      getBookIssuesForStudent(studentId),
      student.school_id ? getSchoolById(student.school_id) : Promise.resolve(null),
    ]);

  return {
    student,
    school,
    grades,
    gradesByTerm: groupGradesByTerm(grades),
    attendanceStats,
    attendanceHistory,
    assignments,
    invoices,
    libraryIssues,
    stats: computeStats(grades, attendanceStats, invoices),
  };
}
