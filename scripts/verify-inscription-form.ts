import assert from "node:assert/strict";
import {
  composeInscriptionAddress,
  formatYesNo,
  normalizeInscriptionFields,
  pickNormalizedInscriptionFields,
} from "../lib/students/inscription";
import {
  optionalYesNoSchema,
  optionalSchoolYearSchema,
  studentSchema,
} from "../lib/validations/student";
import { studentOnboardingSchema } from "../lib/validations/student-onboarding";

assert.equal(
  composeInscriptionAddress({
    address_number: "34",
    address_avenue: "des Aveugles",
    address_quartier: "Masangu",
    address_commune: "Mont-Ngafula",
  }),
  "n° 34, Av. des Aveugles, Q/ Masangu, C/ Mont-Ngafula"
);

assert.equal(formatYesNo(true, { yes: "Oui", no: "Non", empty: "—" }), "Oui");
assert.equal(formatYesNo(false, { yes: "Oui", no: "Non", empty: "—" }), "Non");
assert.equal(formatYesNo(null, { yes: "Oui", no: "Non", empty: "—" }), "—");

assert.equal(optionalYesNoSchema.parse("true"), true);
assert.equal(optionalYesNoSchema.parse("false"), false);
assert.equal(optionalYesNoSchema.parse(""), undefined);
assert.equal(optionalSchoolYearSchema.parse("2026"), 2026);
assert.equal(optionalSchoolYearSchema.parse(""), undefined);

const normalized = normalizeInscriptionFields({
  school_year: 2026,
  place_of_birth: "Kinshasa",
  previous_school: "",
  father_name: "DIKANDA KINDIUNGA CHADRACK",
  mother_name: "DIKANDA PANGU DORCAS",
  responsible_profession: "ARCHITECTE",
  contact_phone: "+243894612964",
  address_number: "34",
  address_avenue: "DES AVEUGLES",
  address_quartier: "MASANGU",
  address_commune: "MONT-NGAFULA",
  chronic_illness: false,
  visual_problem: false,
  physical_problem: false,
  allergies: "",
  difficulties: "",
});

assert.equal(normalized.school_year, 2026);
assert.equal(normalized.previous_school, null);
assert.equal(normalized.chronic_illness, false);
assert.match(String(normalized.home_address), /n° 34/);

const partial = pickNormalizedInscriptionFields({
  place_of_birth: "Kinshasa",
});
assert.deepEqual(Object.keys(partial).sort(), ["place_of_birth"]);
assert.equal(partial.place_of_birth, "Kinshasa");

const paperSample = {
  first_name: "MIRADIE",
  middle_name: "KINDIUNGA",
  last_name: "DIKENDA",
  date_of_birth: "2022-06-22",
  gender: "female",
  class_id: "11111111-1111-4111-8111-111111111111",
  status: "active" as const,
  tags: [],
  school_year: 2026,
  place_of_birth: "KINSHASA",
  previous_school: "",
  father_name: "DIKANDA KINDIUNGA CHADRACK",
  mother_name: "DIKANDA PANGU DORCAS",
  responsible_profession: "ARCHITECTE",
  contact_phone: "+243894612964",
  address_number: "34",
  address_avenue: "DES AVEUGLES",
  address_quartier: "MASANGU",
  address_commune: "MONT-NGAFULA",
  chronic_illness: false,
  visual_problem: false,
  physical_problem: false,
  allergies: "",
  difficulties: "",
  primary_guardian: {
    first_name: "CHADRACK",
    last_name: "DIKANDA",
    email: "parent@example.com",
    relation: "father" as const,
    can_pickup: true,
  },
  pickup_persons: [],
};

const parsed = studentSchema.safeParse(paperSample);
assert.equal(parsed.success, true, JSON.stringify(parsed.error?.issues));

const onboarded = studentOnboardingSchema.safeParse(paperSample);
assert.equal(onboarded.success, true, JSON.stringify(onboarded.error?.issues));

// Every paper-form field must be present on the validated payload
const requiredPaperKeys = [
  "last_name",
  "middle_name",
  "first_name",
  "gender",
  "date_of_birth",
  "place_of_birth",
  "previous_school",
  "class_id",
  "father_name",
  "mother_name",
  "responsible_profession",
  "contact_phone",
  "address_number",
  "address_avenue",
  "address_quartier",
  "address_commune",
  "chronic_illness",
  "visual_problem",
  "physical_problem",
  "allergies",
  "difficulties",
  "school_year",
] as const;

for (const key of requiredPaperKeys) {
  assert.ok(key in (parsed.data ?? {}), `missing schema field: ${key}`);
}

console.log("inscription form parity checks passed");
