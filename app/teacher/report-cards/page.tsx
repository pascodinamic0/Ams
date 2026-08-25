import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  getTeacherClasses,
  getGradesForReportCard,
  getStudentAttendanceStats,
} from "@/lib/db";
import { getStudents } from "@/lib/db/students";
import {
  formatSchoolYear,
  getCurrentSchoolYearStart,
} from "@/lib/academic/school-year";
import { ReportCardFilters } from "./report-card-filters";
import { PrintStudentReportCardButton } from "./print-student-report-card-button";

export default async function ReportCardsPage({
  searchParams,
}: {
  searchParams: Promise<{
    class?: string;
    term?: string;
    year?: string;
    student?: string;
  }>;
}) {
  const t = await getTranslations("teacher");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  if (!profile) {
    return <p className="text-sm text-stone-500">{t("signInRequiredReportCards")}</p>;
  }

  const params = await searchParams;
  const classes = await getTeacherClasses(profile.id);

  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("reportCardsTitle")}</h1>
        <EmptyState title={t("noClassesAssigned")} description={t("noClassesAssignedDesc")} />
      </div>
    );
  }

  const classId = params.class && classes.some((c) => c.id === params.class)
    ? params.class
    : classes[0].id;
  const term = params.term ?? "T1";
  const parsedYear = Number(params.year);
  const schoolYear = Number.isFinite(parsedYear)
    ? parsedYear
    : getCurrentSchoolYearStart();

  const students = await getStudents({ classId, status: "active" });
  const selectedStudentId =
    params.student && students.some((s) => s.id === params.student)
      ? params.student
      : "";
  const studentsToPrint = selectedStudentId
    ? students.filter((s) => s.id === selectedStudentId)
    : students;

  const reportData = await Promise.all(
    studentsToPrint.map(async (student) => {
      const [grades, attendance] = await Promise.all([
        getGradesForReportCard(student.id, term, schoolYear),
        getStudentAttendanceStats(student.id),
      ]);
      return { student, grades, attendance };
    })
  );

  const selectedClass = classes.find((c) => c.id === classId);

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold">{t("reportCardsTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("reportCardsDescription")}</p>
      </div>

      <Suspense fallback={null}>
        <ReportCardFilters
          classes={classes.map((c) => ({ id: c.id, name: c.name }))}
          students={students.map((s) => ({ id: s.id, name: s.name }))}
          initialClassId={classId}
          initialTerm={term}
          initialSchoolYear={schoolYear}
          initialStudentId={selectedStudentId}
        />
      </Suspense>

      {reportData.length === 0 ? (
        <EmptyState title={t("noStudents")} description={t("noActiveStudentsInClass")} />
      ) : (
        <div className="space-y-8">
          {reportData.map(({ student, grades, attendance }) => (
            <article
              key={student.id}
              id={`report-card-${student.id}`}
              className="report-card break-after-page rounded-lg border bg-white p-8 text-stone-900 shadow-sm print:break-after-page print:rounded-none print:border-0 print:shadow-none"
            >
              <div className="mb-4 flex justify-end print:hidden">
                <PrintStudentReportCardButton
                  targetId={`report-card-${student.id}`}
                  label={t("downloadThisReportCard")}
                  documentTitle={`${t("studentReportCard")} — ${student.name}`}
                />
              </div>
              <header className="border-b pb-4 text-center">
                <h2 className="text-xl font-bold">{t("studentReportCard")}</h2>
                <p className="text-sm text-stone-600">
                  {selectedClass?.name} · {formatSchoolYear(schoolYear)} · {term}
                </p>
              </header>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-stone-500">{t("studentNameLabel")}</p>
                  <p className="font-medium">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">{t("studentIdLabel")}</p>
                  <p className="font-medium">{student.student_id ?? tc("emptyDash")}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">{t("classLabel")}</p>
                  <p className="font-medium">{selectedClass?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">{t("attendanceLabel")}</p>
                  <p className="font-medium">
                    {t("attendanceStats", {
                      percentage: attendance.percentage,
                      present: attendance.present,
                      total: attendance.total,
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6 h-24 w-20 overflow-hidden rounded border border-dashed border-stone-300 bg-stone-50 text-center text-xs leading-[6rem] text-stone-400">
                {student.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={student.photo_url}
                    alt={student.name}
                    className="h-full w-full object-cover leading-none"
                  />
                ) : (
                  t("photoPlaceholder")
                )}
              </div>

              <table className="mt-6 w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium">{t("subjectLabel")}</th>
                    <th className="py-2 text-left font-medium">{t("marksCol")}</th>
                    <th className="py-2 text-left font-medium">{t("gradeCol")}</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-stone-500">{t("noGradesForTerm")}</td>
                    </tr>
                  ) : (
                    grades.map((g, i) => (
                      <tr key={i} className="border-b border-stone-100">
                        <td className="py-2">{g.subject_name}</td>
                        <td className="py-2">{g.marks ?? tc("emptyDash")}</td>
                        <td className="py-2">{g.grade ?? tc("emptyDash")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-stone-500">{t("conductRemarks")}</p>
                  <div className="mt-2 h-16 rounded border border-stone-200" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-stone-500">{t("teacherSignature")}</p>
                  <div className="mt-8 border-t border-stone-300 pt-2">{profile.name ?? t("teacherFallback")}</div>
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
          body.printing-one-report-card .report-card:not(.print-target) {
            display: none;
          }
          body.printing-one-report-card .report-card.print-target,
          body.printing-one-report-card .report-card.print-target * {
            visibility: visible;
          }
          body.printing-one-report-card .report-card.print-target {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}
