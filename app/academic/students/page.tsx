import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StudentListFilters } from "@/components/students/student-list-filters";
import { StudentsTable } from "@/components/students/students-table";
import { StudentsInscriptionExportButton } from "@/components/students/students-inscription-export-button";
import { getStudents, getStudentsForInscriptionExport } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { canDeleteStudents, canOnboardStudents } from "@/lib/auth/rbac";
import { getTranslations } from "next-intl/server";
import { isStudentTag } from "@/lib/students/tags";
import { STUDENT_STATUSES } from "@/lib/validations/student";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tag?: string }>;
}) {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  const canDelete = canDeleteStudents(profile?.role);
  const canImport = canOnboardStudents(profile?.role);
  const params = await searchParams;
  const statusFilter =
    params.status &&
    (STUDENT_STATUSES as readonly string[]).includes(params.status)
      ? params.status
      : undefined;
  const tagFilter =
    params.tag && isStudentTag(params.tag) ? params.tag : undefined;

  const students = await getStudents({
    status: statusFilter,
    tag: tagFilter,
  });
  const exportRows = await getStudentsForInscriptionExport({
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
    status: statusFilter,
  });

  const hasFilters = Boolean(statusFilter || tagFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("studentsTitle")}</h1>
        <div className="flex gap-2">
          {students.length > 0 ? (
            <StudentsInscriptionExportButton
              rows={exportRows}
              buttonLabel={t("exportInscriptionCsv")}
              yesNo={{
                yes: tc("yes"),
                no: tc("no"),
                empty: tc("emptyDash"),
                male: t("genderMale"),
                female: t("genderFemale"),
              }}
              columnLabels={{
                student_id: t("studentId"),
                school_year: t("schoolYear"),
                last_name: t("familyName"),
                middle_name: t("postName"),
                first_name: t("givenName"),
                gender: t("gender"),
                date_of_birth: t("dateOfBirth"),
                place_of_birth: t("placeOfBirth"),
                previous_school: t("previousSchool"),
                class_name: t("desiredClass"),
                father_name: t("fatherNames"),
                mother_name: t("motherNames"),
                responsible_profession: t("responsibleProfession"),
                address_number: t("addressNumber"),
                address_avenue: t("addressAvenue"),
                address_quartier: t("addressQuartier"),
                address_commune: t("addressCommune"),
                home_address: t("homeAddress"),
                contact_phone: t("contactPhone"),
                chronic_illness: t("chronicIllness"),
                visual_problem: t("visualProblem"),
                physical_problem: t("physicalProblem"),
                allergies: t("allergies"),
                difficulties: t("difficulties"),
                notes: tc("notes"),
                status: tc("status"),
              }}
            />
          ) : null}
          {canImport ? (
            <Link href="/academic/students/import">
              <Button variant="outline">{t("importCsv")}</Button>
            </Link>
          ) : null}
          {canImport ? (
            <Link href="/academic/students/new">
              <Button>{t("onboardStudent")}</Button>
            </Link>
          ) : null}
        </div>
      </div>

      <Suspense fallback={null}>
        <StudentListFilters
          initialStatus={statusFilter ?? ""}
          initialTag={tagFilter ?? ""}
        />
      </Suspense>

      {students.length === 0 ? (
        <EmptyState
          title={hasFilters ? t("noStudentsMatchFilters") : t("noStudentsYet")}
          description={
            hasFilters ? t("noStudentsMatchFiltersDesc") : t("noStudentsDesc")
          }
          action={
            hasFilters || !canImport ? undefined : (
              <Link href="/academic/students/new">
                <Button>{t("onboardStudent")}</Button>
              </Link>
            )
          }
        />
      ) : (
        <StudentsTable students={students} canDelete={canDelete} />
      )}
    </div>
  );
}
