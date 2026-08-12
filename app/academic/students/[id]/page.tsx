import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyableBadge } from "@/components/ui/copyable-badge";
import { UserAvatar } from "@/components/layout/user-avatar";
import { getStudentProfileBundle } from "@/lib/db/student-profile";
import { formatPersonName } from "@/lib/utils";
import { DeleteStudentButton } from "./delete-button";

type GuardianLink = {
  can_pickup?: boolean | null;
  guardians: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    relation: string;
    address?: string | null;
    workplace?: string | null;
  } | null;
};

type PickupPerson = {
  id: string;
  full_name: string;
  phone: string;
  relationship: string;
  notes?: string | null;
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        {hint ? <p className="mt-1 text-xs text-stone-400">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const { id } = await params;

  const bundle = await getStudentProfileBundle(id);
  if (!bundle) notFound();

  const {
    student,
    grades,
    gradesByTerm,
    attendanceStats,
    attendanceHistory,
    assignments,
    invoices,
    libraryIssues,
    stats,
  } = bundle;

  const guardians = (student.guardian_students as GuardianLink[] | null) ?? [];
  const pickupPersons =
    (student.student_pickup_persons as PickupPerson[] | null) ?? [];
  const authorizedGuardians = guardians.filter((g) => g.can_pickup && g.guardians);
  const fullName = formatPersonName(student);
  const className =
    (student.classes as { name?: string } | null)?.name ?? tc("emptyDash");
  const termOrder = Object.keys(gradesByTerm).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <UserAvatar name={fullName} avatarUrl={student.photo_url} size="lg" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{fullName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {student.student_id ? (
                <CopyableBadge
                  value={student.student_id}
                  label={`${t("studentId")}: ${student.student_id}`}
                />
              ) : (
                <p className="text-sm text-stone-500">
                  {t("studentId")}: {tc("emptyDash")}
                </p>
              )}
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs capitalize text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                {student.status}
              </span>
              <span className="text-sm text-stone-500">{className}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/academic/students">
            <Button variant="ghost" size="sm">
              {tc("back")}
            </Button>
          </Link>
          <Link href={`/academic/students/${id}/report-card`}>
            <Button size="sm">{t("exportReportCard")}</Button>
          </Link>
          <DeleteStudentButton id={id} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("attendance")}
          value={`${stats.attendancePercentage}%`}
          hint={t("attendanceStats", {
            percentage: attendanceStats.percentage,
            present: attendanceStats.present,
            total: attendanceStats.total,
          })}
        />
        <StatCard
          label={t("averageMarks")}
          value={stats.averageMarks ?? tc("emptyDash")}
          hint={t("gradesRecorded", { count: stats.gradeCount })}
        />
        <StatCard
          label={t("subjects")}
          value={stats.subjectCount}
          hint={t("termsCount", { count: stats.terms.length })}
        />
        <StatCard
          label={t("outstandingFees")}
          value={stats.outstandingFees}
          hint={t("invoicesCount", { count: invoices.length })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-stone-500">{tc("status")}:</span>{" "}
              {student.status}
            </p>
            <p>
              <span className="text-stone-500">{t("dob")}:</span>{" "}
              {student.date_of_birth ?? tc("emptyDash")}
            </p>
            {student.gender ? (
              <p>
                <span className="text-stone-500">{t("gender")}:</span>{" "}
                {student.gender}
              </p>
            ) : null}
            <p>
              <span className="text-stone-500">{t("class")}:</span> {className}
            </p>
            {student.home_address ? (
              <p>
                <span className="text-stone-500">{t("homeAddress")}:</span>{" "}
                {student.home_address}
              </p>
            ) : null}
            {student.notes ? (
              <div>
                <p className="text-stone-500">{tc("notes")}:</p>
                <p className="mt-1 whitespace-pre-wrap">{student.notes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
            <CardTitle className="flex-1">{t("guardians")}</CardTitle>
            <Link href={`/academic/students/${id}/guardians/new`} className="shrink-0">
              <Button size="sm" variant="outline">
                {t("addGuardian")}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {guardians.length === 0 ? (
              <p className="text-sm text-stone-500">{t("noGuardiansLinked")}</p>
            ) : (
              guardians.map((g) => {
                const guardian = g.guardians;
                if (!guardian) return null;
                return (
                  <Link
                    key={guardian.id}
                    href={`/academic/students/${id}/guardians/${guardian.id}`}
                    className="block rounded-lg border border-stone-200 p-3 transition hover:border-primary-300 hover:bg-primary-light/50 dark:border-stone-700 dark:hover:border-primary-700 dark:hover:bg-primary-light/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-primary dark:text-primary">
                        {guardian.name}
                      </p>
                      {g.can_pickup ? (
                        <span className="shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          {t("canPickup")}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-stone-500">
                      {guardian.email}
                      {guardian.phone ? ` · ${guardian.phone}` : ""}
                    </p>
                    <p className="text-xs capitalize text-stone-400">
                      {guardian.relation}
                    </p>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div className="min-w-0 flex-1">
            <CardTitle>{t("academicHistory")}</CardTitle>
            <p className="mt-1 text-sm font-normal text-stone-500">
              {t("academicHistoryDesc")}
            </p>
          </div>
          <Link href={`/academic/students/${id}/report-card`} className="shrink-0">
            <Button size="sm" variant="outline">
              {t("viewReportCard")}
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-6">
          {grades.length === 0 ? (
            <p className="text-sm text-stone-500">{t("noGradesYet")}</p>
          ) : (
            termOrder.map((term) => (
              <div key={term}>
                <h3 className="mb-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
                  {term}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-stone-500">
                        <th className="py-2 font-medium">{t("subject")}</th>
                        <th className="py-2 font-medium">{t("marks")}</th>
                        <th className="py-2 font-medium">{t("letterGrade")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradesByTerm[term].map((g) => (
                        <tr key={g.id} className="border-b border-stone-100 dark:border-stone-800">
                          <td className="py-2">{g.subject_name}</td>
                          <td className="py-2">{g.marks ?? tc("emptyDash")}</td>
                          <td className="py-2">{g.grade ?? tc("emptyDash")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("attendanceHistory")}</CardTitle>
            <p className="mt-1 text-sm font-normal text-stone-500">
              {t("attendanceHistoryDesc")}
            </p>
          </CardHeader>
          <CardContent>
            {attendanceHistory.length === 0 ? (
              <p className="text-sm text-stone-500">{t("noAttendanceYet")}</p>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-stone-950">
                    <tr className="border-b text-left text-stone-500">
                      <th className="py-2 font-medium">{tc("date")}</th>
                      <th className="py-2 font-medium">{tc("status")}</th>
                      <th className="py-2 font-medium">{t("period")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-stone-100 dark:border-stone-800"
                      >
                        <td className="py-2">{row.date}</td>
                        <td className="py-2 capitalize">{row.status}</td>
                        <td className="py-2">
                          {row.period != null && row.period > 0
                            ? row.period
                            : tc("emptyDash")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("assignments")}</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-sm text-stone-500">{t("noAssignmentsYet")}</p>
            ) : (
              <div className="max-h-72 space-y-3 overflow-y-auto">
                {assignments.slice(0, 20).map((a) => (
                  <div
                    key={a.id}
                    className="rounded-lg border border-stone-200 p-3 dark:border-stone-700"
                  >
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-stone-500">
                      {a.due_date
                        ? `${t("due")}: ${a.due_date}`
                        : t("noDueDate")}
                      {a.teacher_name ? ` · ${a.teacher_name}` : ""}
                      {a.submitted_at
                        ? ` · ${t("submitted")}`
                        : ` · ${t("notSubmitted")}`}
                      {a.grade != null ? ` · ${a.grade}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("feesInvoices")}</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-stone-500">{t("noInvoicesYet")}</p>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-stone-950">
                    <tr className="border-b text-left text-stone-500">
                      <th className="py-2 font-medium">{t("fee")}</th>
                      <th className="py-2 font-medium">{t("amount")}</th>
                      <th className="py-2 font-medium">{t("balance")}</th>
                      <th className="py-2 font-medium">{tc("status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b border-stone-100 dark:border-stone-800"
                      >
                        <td className="py-2">
                          {inv.fee_structure_name ??
                            inv.description ??
                            tc("emptyDash")}
                        </td>
                        <td className="py-2">{inv.amount}</td>
                        <td className="py-2">{inv.balance}</td>
                        <td className="py-2 capitalize">{inv.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("libraryHistory")}</CardTitle>
          </CardHeader>
          <CardContent>
            {libraryIssues.length === 0 ? (
              <p className="text-sm text-stone-500">{t("noLibraryIssues")}</p>
            ) : (
              <div className="max-h-72 space-y-3 overflow-y-auto">
                {libraryIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="rounded-lg border border-stone-200 p-3 dark:border-stone-700"
                  >
                    <p className="font-medium">{issue.title}</p>
                    <p className="text-xs text-stone-500">
                      {issue.issued_at} → {issue.due_at}
                      {" · "}
                      <span className="capitalize">{issue.status}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("pickupAuthorization")}</CardTitle>
          <p className="text-sm font-normal text-stone-500">
            {t("pickupAuthorizationDesc")}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {authorizedGuardians.length === 0 && pickupPersons.length === 0 ? (
            <p className="text-sm text-stone-500">{t("noPickupPersons")}</p>
          ) : (
            <>
              {authorizedGuardians.map((g) => {
                const guardian = g.guardians!;
                return (
                  <div
                    key={`guardian-${guardian.id}`}
                    className="rounded-lg border border-stone-200 p-3 dark:border-stone-700"
                  >
                    <p className="font-medium">{guardian.name}</p>
                    <p className="text-sm text-stone-500">
                      {guardian.phone ?? guardian.email}
                      {" · "}
                      <span className="capitalize">{guardian.relation}</span>
                      {" · "}
                      {t("guardian")}
                    </p>
                  </div>
                );
              })}
              {pickupPersons.map((person) => (
                <div
                  key={person.id}
                  className="rounded-lg border border-stone-200 p-3 dark:border-stone-700"
                >
                  <p className="font-medium">{person.full_name}</p>
                  <p className="text-sm text-stone-500">
                    {person.phone}
                    {" · "}
                    <span className="capitalize">
                      {person.relationship.replace(/_/g, " ")}
                    </span>
                  </p>
                  {person.notes ? (
                    <p className="mt-1 text-xs text-stone-400">{person.notes}</p>
                  ) : null}
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
