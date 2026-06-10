import { Suspense } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getTeacherClasses,
  getGradesForReportCard,
  getStudentAttendanceStats,
} from "@/lib/db";
import { getStudents } from "@/lib/db/students";
import { ReportCardFilters } from "./report-card-filters";

export default async function ReportCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; term?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return <p className="text-sm text-slate-500">Please sign in to view report cards.</p>;
  }

  const params = await searchParams;
  const classes = await getTeacherClasses(profile.id);

  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Report Cards</h1>
        <EmptyState title="No classes assigned" description="Assign classes in the timetable first." />
      </div>
    );
  }

  const classId = params.class && classes.some((c) => c.id === params.class)
    ? params.class
    : classes[0].id;
  const term = params.term ?? "Term 1";

  const students = await getStudents({ classId, status: "active" });

  const reportData = await Promise.all(
    students.map(async (student) => {
      const [grades, attendance] = await Promise.all([
        getGradesForReportCard(student.id, term),
        getStudentAttendanceStats(student.id),
      ]);
      return { student, grades, attendance };
    })
  );

  const selectedClass = classes.find((c) => c.id === classId);

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold">Report Cards</h1>
        <p className="mt-1 text-sm text-slate-500">Preview and print student report cards.</p>
      </div>

      <Suspense fallback={null}>
        <ReportCardFilters
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
          initialClassId={classId}
          initialTerm={term}
        />
      </Suspense>

      {reportData.length === 0 ? (
        <EmptyState title="No students" description="No active students in this class." />
      ) : (
        <div className="space-y-8">
          {reportData.map(({ student, grades, attendance }) => (
            <article
              key={student.id}
              className="report-card break-after-page rounded-lg border bg-white p-8 text-slate-900 shadow-sm print:break-after-page print:rounded-none print:border-0 print:shadow-none"
            >
              <header className="border-b pb-4 text-center">
                <h2 className="text-xl font-bold">Student Report Card</h2>
                <p className="text-sm text-slate-600">{selectedClass?.name} · {term}</p>
              </header>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Student name</p>
                  <p className="font-medium">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Student ID</p>
                  <p className="font-medium">{student.student_id ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Class</p>
                  <p className="font-medium">{selectedClass?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Attendance</p>
                  <p className="font-medium">{attendance.percentage}% ({attendance.present}/{attendance.total} days)</p>
                </div>
              </div>

              <div className="mt-6 h-24 w-20 rounded border border-dashed border-slate-300 bg-slate-50 text-center text-xs leading-[6rem] text-slate-400">
                Photo
              </div>

              <table className="mt-6 w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium">Subject</th>
                    <th className="py-2 text-left font-medium">Marks</th>
                    <th className="py-2 text-left font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-slate-500">No grades recorded for this term.</td>
                    </tr>
                  ) : (
                    grades.map((g, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-2">{g.subject_name}</td>
                        <td className="py-2">{g.marks ?? "—"}</td>
                        <td className="py-2">{g.grade ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Conduct / Remarks</p>
                  <div className="mt-2 h-16 rounded border border-slate-200" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Teacher signature</p>
                  <div className="mt-8 border-t border-slate-300 pt-2">{profile.name ?? "Teacher"}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .report-card, .report-card * { visibility: visible; }
          .report-card { position: relative; page-break-after: always; }
        }
      `}</style>
    </div>
  );
}
