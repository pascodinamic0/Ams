"use client";

import { ExportButton } from "@/components/ui/export-button";
import { formatSchoolYear } from "@/lib/academic/school-year";
import { formatYesNo } from "@/lib/students/inscription";
import type { StudentInscriptionExportRow } from "@/lib/db/students";

type Labels = {
  yes: string;
  no: string;
  empty: string;
  male: string;
  female: string;
};

type Props = {
  rows: StudentInscriptionExportRow[];
  buttonLabel: string;
  columnLabels: Record<string, string>;
  yesNo: Labels;
};

function genderLabel(value: string | null, labels: Labels) {
  if (value === "male") return labels.male;
  if (value === "female") return labels.female;
  return labels.empty;
}

export function StudentsInscriptionExportButton({
  rows,
  buttonLabel,
  columnLabels,
  yesNo,
}: Props) {
  const data = rows.map((row) => ({
    student_id: row.student_id ?? "",
    school_year: row.school_year != null ? formatSchoolYear(row.school_year) : "",
    last_name: row.last_name,
    middle_name: row.middle_name ?? "",
    first_name: row.first_name,
    gender: genderLabel(row.gender, yesNo),
    date_of_birth: row.date_of_birth ?? "",
    place_of_birth: row.place_of_birth ?? "",
    previous_school: row.previous_school ?? "",
    class_name: row.class_name ?? "",
    father_name: row.father_name ?? "",
    mother_name: row.mother_name ?? "",
    responsible_profession: row.responsible_profession ?? "",
    address_number: row.address_number ?? "",
    address_avenue: row.address_avenue ?? "",
    address_quartier: row.address_quartier ?? "",
    address_commune: row.address_commune ?? "",
    home_address: row.home_address ?? "",
    contact_phone: row.contact_phone ?? "",
    chronic_illness: formatYesNo(row.chronic_illness, yesNo),
    visual_problem: formatYesNo(row.visual_problem, yesNo),
    physical_problem: formatYesNo(row.physical_problem, yesNo),
    allergies: row.allergies ?? "",
    difficulties: row.difficulties ?? "",
    notes: row.notes ?? "",
    status: row.status,
  }));

  const columns = (
    [
      "student_id",
      "school_year",
      "last_name",
      "middle_name",
      "first_name",
      "gender",
      "date_of_birth",
      "place_of_birth",
      "previous_school",
      "class_name",
      "father_name",
      "mother_name",
      "responsible_profession",
      "address_number",
      "address_avenue",
      "address_quartier",
      "address_commune",
      "home_address",
      "contact_phone",
      "chronic_illness",
      "visual_problem",
      "physical_problem",
      "allergies",
      "difficulties",
      "notes",
      "status",
    ] as const
  ).map((key) => ({
    key,
    label: columnLabels[key] ?? key,
  }));

  return (
    <ExportButton
      data={data}
      columns={columns}
      filename="fiche-inscription-eleves"
      label={buttonLabel}
    />
  );
}
