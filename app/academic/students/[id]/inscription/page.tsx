import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ExportPdfButton } from "@/components/students/export-pdf-button";
import { StudentInscriptionFiche } from "@/components/students/student-inscription-fiche";
import { getSchoolById, getStudentById } from "@/lib/db";
import { formatStudentName } from "@/lib/utils";
import { formatSchoolYear } from "@/lib/academic/school-year";
import {
  composeInscriptionAddress,
  formatYesNo,
} from "@/lib/students/inscription";
import {
  IMPORT_DOB_NOTE,
  IMPORT_DOB_PLACEHOLDER,
} from "@/lib/students/import-file";

export default async function StudentInscriptionFichePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();

  const school = student.school_id
    ? await getSchoolById(student.school_id)
    : null;

  const yesNo = {
    yes: tc("yes"),
    no: tc("no"),
    empty: tc("emptyDash"),
  };
  const empty = tc("emptyDash");
  const className =
    (student.classes as { name?: string } | null)?.name ?? empty;
  const schoolYearLabel =
    student.school_year != null
      ? formatSchoolYear(student.school_year)
      : empty;
  const address =
    composeInscriptionAddress(student) || student.home_address || empty;
  const dobIncomplete =
    student.date_of_birth === IMPORT_DOB_PLACEHOLDER &&
    student.notes === IMPORT_DOB_NOTE;
  const genderLabel =
    student.gender === "male"
      ? t("genderMale")
      : student.gender === "female"
        ? t("genderFemale")
        : empty;
  const fullName = formatStudentName(student) || empty;
  const notes = dobIncomplete ? "" : (student.notes ?? "");

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-editorial text-2xl font-semibold tracking-tight">
            {t("exportInscriptionFiche")}
          </h1>
          <p className="text-sm text-muted">{fullName}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/academic/students/${id}`}>
            <Button variant="ghost" size="sm">
              {tc("back")}
            </Button>
          </Link>
          <ExportPdfButton label={t("exportPdf")} />
        </div>
      </div>

      <StudentInscriptionFiche
        school={
          school
            ? {
                name: school.name,
                logoUrl: school.logo_url,
                address: school.address,
                phone: school.contact_phone,
                primaryColor: school.theme_primary_color || "#0d9488",
              }
            : null
        }
        data={{
          fullName,
          lastName: student.last_name || empty,
          middleName: student.middle_name || empty,
          firstName: student.first_name || empty,
          gender: genderLabel,
          placeOfBirth: student.place_of_birth || empty,
          dateOfBirth: dobIncomplete
            ? t("dobToComplete")
            : student.date_of_birth || empty,
          previousSchool: student.previous_school || empty,
          className,
          fatherName: student.father_name || empty,
          motherName: student.mother_name || empty,
          profession: student.responsible_profession || empty,
          address,
          phone: student.contact_phone || empty,
          chronicIllness: formatYesNo(student.chronic_illness, yesNo),
          visualProblem: formatYesNo(student.visual_problem, yesNo),
          physicalProblem: formatYesNo(student.physical_problem, yesNo),
          allergies: student.allergies || empty,
          difficulties: student.difficulties || empty,
          notes,
          photoUrl: student.photo_url ?? null,
        }}
        labels={{
          title: t("inscriptionFicheTitle", { year: schoolYearLabel }),
          number: t("inscriptionFicheNumber", {
            number: student.student_id ?? ".........",
          }),
          identity: t("inscriptionSectionIdentity"),
          family: t("inscriptionSectionFamily"),
          health: t("inscriptionSectionHealth"),
          familyName: t("familyName"),
          postName: t("postName"),
          givenName: t("givenName"),
          gender: t("gender"),
          placeOfBirth: t("placeOfBirth"),
          dob: t("dob"),
          previousSchool: t("previousSchool"),
          desiredClass: t("desiredClass"),
          fatherNames: t("fatherNames"),
          motherNames: t("motherNames"),
          profession: t("responsibleProfession"),
          address: t("address"),
          phone: t("contactPhone"),
          chronicIllness: t("chronicIllness"),
          visualProblem: t("visualProblem"),
          physicalProblem: t("physicalProblem"),
          allergies: t("allergies"),
          difficulties: t("difficulties"),
          notes: t("notesAboutChild"),
          photo: t("photo"),
          guardianSignature: t("inscriptionGuardianSignature"),
          schoolSignature: t("inscriptionSchoolSignature"),
          yes: tc("yes"),
        }}
      />

      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body * { visibility: hidden; }
          .inscription-fiche, .inscription-fiche * { visibility: visible; }
          .inscription-fiche {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            min-height: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
