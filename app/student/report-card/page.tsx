import { Suspense } from "react";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportPdfButton } from "@/components/students/export-pdf-button";
import { ReportCardTermFilter } from "@/components/students/report-card-term-filter";
import { StudentReportCard } from "@/components/students/student-report-card";
import { getCurrentProfile } from "@/lib/auth/session";
import { getStudentByAuthUserId } from "@/lib/db/students";
import { getGradesForReportCard, getGradesForStudent } from "@/lib/db/grades";
import { getStudentAttendanceStats } from "@/lib/db/attendance";
import { getSchoolById } from "@/lib/db/schools";
import { getStudentById } from "@/lib/db/students";

export default async function StudentPortalReportCardPage({
  searchParams,
}: {
  searchParams: Promise<{ term?: string }>;
}) {
  const t = await getTranslations("student");
  const ta = await getTranslations("academic");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title={t("notSignedIn")} description={t("notSignedInDescReportCard")} />
    );
  }

  const portalStudent = await getStudentByAuthUserId(profile.id);
  if (!portalStudent) {
    return (
      <EmptyState
        title={t("noStudentProfile")}
        description={t("noStudentProfileDescShort")}
      />
    );
  }

  const { term: termParam } = await searchParams;
  const [allGrades, studentRow, school, attendance] = await Promise.all([
    getGradesForStudent(portalStudent.id),
    getStudentById(portalStudent.id),
    getSchoolById(portalStudent.school_id),
    getStudentAttendanceStats(portalStudent.id),
  ]);

  const terms = [...new Set(allGrades.map((g) => g.term))].sort();
  const term = termParam ?? terms[0] ?? ta("reportCardDefaultTerm");
  const grades = await getGradesForReportCard(portalStudent.id, term);

  const termMarks = grades
    .map((g) => g.marks)
    .filter((m): m is number => m !== null);
  const averageMarks =
    termMarks.length > 0
      ? Math.round(termMarks.reduce((s, m) => s + m, 0) / termMarks.length)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">{t("reportCardTitle")}</h1>
          <p className="mt-1 text-sm text-stone-500">{t("reportCardSubtitle")}</p>
        </div>
        <ExportPdfButton label={t("exportPdf")} />
      </div>

      <Suspense fallback={null}>
        <ReportCardTermFilter
          basePath="/student/report-card"
          initialTerm={term}
          termLabel={ta("term")}
          termPlaceholder={ta("reportCardDefaultTerm")}
          availableTerms={terms}
        />
      </Suspense>

      <StudentReportCard
        schoolName={school?.name ?? null}
        schoolLogoUrl={school?.logo_url}
        schoolAddress={school?.address}
        studentName={portalStudent.name}
        studentId={portalStudent.student_id}
        studentPhotoUrl={studentRow?.photo_url ?? null}
        className={portalStudent.class_name}
        term={term}
        grades={grades}
        attendance={attendance}
        averageMarks={averageMarks}
        labels={{
          title: ta("reportCardTitle"),
          studentName: ta("studentName"),
          studentId: ta("studentId"),
          classLabel: ta("class"),
          termLabel: ta("term"),
          attendance: ta("attendance"),
          attendanceStats: ({ percentage, present, total }) =>
            ta("attendanceStats", { percentage, present, total }),
          photo: ta("photo"),
          subject: ta("subject"),
          marks: ta("marks"),
          grade: ta("letterGrade"),
          noGrades: ta("noGradesForTerm"),
          conductRemarks: ta("conductRemarks"),
          averageMarks: ta("averageMarks"),
          emptyDash: tc("emptyDash"),
          issuedOn: ta("issuedOn"),
        }}
        issuedAt={format(new Date(), "yyyy-MM-dd")}
        signatureLabel={ta("authorizedSignature")}
      />

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .report-card, .report-card * { visibility: visible; }
          .report-card { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
