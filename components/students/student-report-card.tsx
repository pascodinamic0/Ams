import type { ReportCardGrade } from "@/lib/db/grades";

export type StudentReportCardLabels = {
  title: string;
  studentName: string;
  studentId: string;
  classLabel: string;
  termLabel: string;
  attendance: string;
  attendanceStats: (values: {
    percentage: number;
    present: number;
    total: number;
  }) => string;
  photo: string;
  subject: string;
  marks: string;
  grade: string;
  noGrades: string;
  conductRemarks: string;
  averageMarks: string;
  emptyDash: string;
  issuedOn: string;
};

type Props = {
  schoolName: string | null;
  schoolLogoUrl?: string | null;
  schoolAddress?: string | null;
  studentName: string;
  studentId: string | null;
  studentPhotoUrl?: string | null;
  className: string | null;
  term: string;
  grades: ReportCardGrade[];
  attendance: { percentage: number; present: number; total: number };
  averageMarks: number | null;
  labels: StudentReportCardLabels;
  issuedAt?: string;
  signatureName?: string | null;
  signatureLabel?: string;
};

export function StudentReportCard({
  schoolName,
  schoolLogoUrl,
  schoolAddress,
  studentName,
  studentId,
  studentPhotoUrl,
  className,
  term,
  grades,
  attendance,
  averageMarks,
  labels,
  issuedAt,
  signatureName,
  signatureLabel,
}: Props) {
  return (
    <article className="report-card break-after-page rounded-lg border bg-white p-8 text-stone-900 shadow-sm print:break-after-page print:rounded-none print:border-0 print:shadow-none">
      <header className="border-b pb-4 text-center">
        {schoolLogoUrl ? (
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={schoolLogoUrl}
              alt={schoolName ?? ""}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        {schoolName ? <p className="text-lg font-semibold">{schoolName}</p> : null}
        {schoolAddress ? (
          <p className="mt-0.5 text-xs text-stone-500">{schoolAddress}</p>
        ) : null}
        <h2 className="mt-3 text-xl font-bold">{labels.title}</h2>
        <p className="text-sm text-stone-600">
          {className ?? labels.emptyDash} � {term}
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-6">
        <div className="h-28 w-24 shrink-0 overflow-hidden rounded border border-dashed border-stone-300 bg-stone-50">
          {studentPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={studentPhotoUrl}
              alt={studentName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-stone-400">
              {labels.photo}
            </div>
          )}
        </div>

        <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-stone-500">{labels.studentName}</p>
            <p className="font-medium">{studentName}</p>
          </div>
          <div>
            <p className="text-sm text-stone-500">{labels.studentId}</p>
            <p className="font-medium font-mono tracking-wide">
              {studentId ?? labels.emptyDash}
            </p>
          </div>
          <div>
            <p className="text-sm text-stone-500">{labels.classLabel}</p>
            <p className="font-medium">{className ?? labels.emptyDash}</p>
          </div>
          <div>
            <p className="text-sm text-stone-500">{labels.termLabel}</p>
            <p className="font-medium">{term}</p>
          </div>
          <div>
            <p className="text-sm text-stone-500">{labels.attendance}</p>
            <p className="font-medium">{labels.attendanceStats(attendance)}</p>
          </div>
          <div>
            <p className="text-sm text-stone-500">{labels.averageMarks}</p>
            <p className="font-medium">
              {averageMarks !== null ? averageMarks : labels.emptyDash}
            </p>
          </div>
        </div>
      </div>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left font-medium">{labels.subject}</th>
            <th className="py-2 text-left font-medium">{labels.marks}</th>
            <th className="py-2 text-left font-medium">{labels.grade}</th>
          </tr>
        </thead>
        <tbody>
          {grades.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-4 text-stone-500">
                {labels.noGrades}
              </td>
            </tr>
          ) : (
            grades.map((g, i) => (
              <tr key={`${g.subject_name}-${i}`} className="border-b border-stone-100">
                <td className="py-2">{g.subject_name}</td>
                <td className="py-2">{g.marks ?? labels.emptyDash}</td>
                <td className="py-2">{g.grade ?? labels.emptyDash}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <p className="text-sm text-stone-500">{labels.conductRemarks}</p>
          <div className="mt-2 h-16 rounded border border-stone-200" />
        </div>
        <div className="text-right">
          {signatureLabel ? (
            <p className="text-sm text-stone-500">{signatureLabel}</p>
          ) : null}
          <div className="mt-8 border-t border-stone-300 pt-2">
            {signatureName ?? "\u00a0"}
          </div>
        </div>
      </div>

      {issuedAt ? (
        <p className="mt-6 text-xs text-stone-400">
          {labels.issuedOn}: {issuedAt}
        </p>
      ) : null}
    </article>
  );
}
