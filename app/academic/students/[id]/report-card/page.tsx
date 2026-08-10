import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ExportPdfButton } from "@/components/students/export-pdf-button";
import { ReportCardTermFilter } from "@/components/students/report-card-term-filter";
import { StudentReportCard } from "@/components/students/student-report-card";
import { getGradesForReportCard } from "@/lib/db/grades";
import { getStudentAttendanceStats } from "@/lib/db/attendance";
import { getStudentProfileBundle } from "@/lib/db/student-profile";
import { formatPersonName } from "@/lib/utils";

export default async function StudentReportCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ term?: string }>;
}) {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const { id } = await params;
  const { term: termParam } = await searchParams;

  const bundle = await getStudentProfileBundle(id);
  if (!bundle) notFound();

  const { student, school, stats } = bundle;
  const fullName = formatPersonName(student);
  const className =
    (student.classes as { name?: string } | null)?.name ?? null;

  const term =
    termParam ??
    stats.terms[0] ??
    t("reportCardDefaultTerm");

  const [grades, attendance] = await Promise.all([
    getGradesForReportCard(id, term),
    getStudentAttendanceStats(id),
  ]);

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
          <p className="mt-1 text-sm text-stone-500">
            {fullName}
            {student.student_id ? ` � ${student.student_id}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/academic/students/${id}`}>
            <Button variant="ghost" size="sm">
              {t("backToStudent")}
            </Button>
          </Link>
          <ExportPdfButton label={t("exportPdf")} />
        </div>
      </div>

      <Suspense fallback={null}>
        <ReportCardTermFilter
          basePath={`/academic/students/${id}/report-card`}
          initialTerm={term}
          termLabel={t("term")}
          termPlaceholder={t("reportCardDefaultTerm")}
          availableTerms={stats.terms}
        />
      </Suspense>

      <StudentReportCard
        schoolName={school?.name ?? null}
        schoolLogoUrl={school?.logo_url}
        schoolAddress={school?.address}
        studentName={fullName}
        studentId={student.student_id}
        studentPhotoUrl={student.photo_url}
        className={className}
        term={term}
        grades={grades}
        attendance={attendance}
        averageMarks={averageMarks}
        labels={{
          title: t("reportCardTitle"),
          studentName: t("studentName"),
          studentId: t("studentId"),
          classLabel: t("class"),
          termLabel: t("term"),
          attendance: t("attendance"),
          attendanceStats: ({ percentage, present, total }) =>
            t("attendanceStats", { percentage, present, total }),
          photo: t("photo"),
          subject: t("subject"),
          marks: t("marks"),
          grade: t("letterGrade"),
          noGrades: t("noGradesForTerm"),
          conductRemarks: t("conductRemarks"),
          averageMarks: t("averageMarks"),
          emptyDash: tc("emptyDash"),
          issuedOn: t("issuedOn"),
        }}
        issuedAt={format(new Date(), "yyyy-MM-dd")}
        signatureLabel={t("authorizedSignature")}
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
