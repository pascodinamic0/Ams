import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ExportPdfButton } from "@/components/students/export-pdf-button";
import { getStudentById } from "@/lib/db";
import { formatPersonName } from "@/lib/utils";
import { formatSchoolYear } from "@/lib/academic/school-year";
import {
  composeInscriptionAddress,
  formatYesNo,
} from "@/lib/students/inscription";

function FicheRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-stone-200 py-2 sm:grid-cols-[14rem_1fr] print:grid-cols-[12rem_1fr]">
      <dt className="text-sm font-medium text-stone-600">{label}</dt>
      <dd className="text-sm text-stone-900">{value || "—"}</dd>
    </div>
  );
}

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

  const yesNo = {
    yes: tc("yes"),
    no: tc("no"),
    empty: tc("emptyDash"),
  };
  const className =
    (student.classes as { name?: string } | null)?.name ?? tc("emptyDash");
  const schoolYearLabel =
    student.school_year != null
      ? formatSchoolYear(student.school_year)
      : tc("emptyDash");
  const address =
    composeInscriptionAddress(student) ||
    student.home_address ||
    tc("emptyDash");
  const placeAndDob = [student.place_of_birth, student.date_of_birth]
    .filter(Boolean)
    .join(" — ") || tc("emptyDash");
  const genderLabel =
    student.gender === "male"
      ? t("genderMale")
      : student.gender === "female"
        ? t("genderFemale")
        : tc("emptyDash");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">{t("exportInscriptionFiche")}</h1>
          <p className="text-sm text-stone-500">{formatPersonName(student)}</p>
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

      <article className="rounded-lg border border-stone-200 bg-white p-6 text-stone-900 shadow-sm print:border-0 print:shadow-none">
        <header className="mb-6 border-b border-stone-300 pb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {t("inscriptionFicheNumber", {
              number: student.student_id ?? "………",
            })}
          </p>
          <h2 className="mt-2 text-xl font-bold uppercase">
            {t("inscriptionFicheTitle", { year: schoolYearLabel })}
          </h2>
        </header>

        <section className="mb-8">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">
            {t("inscriptionSectionIdentity")}
          </h3>
          <dl>
            <FicheRow label={t("familyName")} value={student.last_name} />
            <FicheRow
              label={t("postName")}
              value={student.middle_name ?? ""}
            />
            <FicheRow label={t("givenName")} value={student.first_name} />
            <FicheRow label={t("gender")} value={genderLabel} />
            <FicheRow label={t("lieuEtDateNaissance")} value={placeAndDob} />
            <FicheRow
              label={t("previousSchool")}
              value={student.previous_school ?? ""}
            />
            <FicheRow label={t("desiredClass")} value={className} />
            <FicheRow
              label={t("fatherNames")}
              value={student.father_name ?? ""}
            />
            <FicheRow
              label={t("motherNames")}
              value={student.mother_name ?? ""}
            />
            <FicheRow
              label={t("responsibleProfession")}
              value={student.responsible_profession ?? ""}
            />
            <FicheRow label={t("address")} value={address} />
            <FicheRow
              label={t("contactPhone")}
              value={student.contact_phone ?? ""}
            />
          </dl>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">
            {t("inscriptionSectionOther")}
          </h3>
          <dl>
            <FicheRow
              label={t("chronicIllness")}
              value={formatYesNo(student.chronic_illness, yesNo)}
            />
            <FicheRow
              label={t("visualProblem")}
              value={formatYesNo(student.visual_problem, yesNo)}
            />
            <FicheRow
              label={t("physicalProblem")}
              value={formatYesNo(student.physical_problem, yesNo)}
            />
            <FicheRow label={t("allergies")} value={student.allergies ?? ""} />
            <FicheRow
              label={t("difficulties")}
              value={student.difficulties ?? ""}
            />
            {student.notes ? (
              <FicheRow label={t("notesAboutChild")} value={student.notes} />
            ) : null}
          </dl>
        </section>
      </article>
    </div>
  );
}
