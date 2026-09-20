import * as XLSX from "xlsx";
import type { Gender } from "@/lib/validations/student";

export const STUDENT_IMPORT_HEADERS = [
  "last_name",
  "middle_name",
  "first_name",
  "gender",
  "place_of_birth",
  "date_of_birth",
  "class",
  "previous_school",
  "parent_name",
  "parent_phone",
  "address",
  "parent_profession",
] as const;

export const STUDENT_IMPORT_REQUIRED_HEADERS = [
  "last_name",
  "first_name",
  "date_of_birth",
  "class",
] as const;

export type StudentImportHeader = (typeof STUDENT_IMPORT_HEADERS)[number];
export type ImportLocale = "fr" | "en";

const HEADER_ALIASES: Record<StudentImportHeader, readonly string[]> = {
  last_name: [
    "last_name",
    "lastname",
    "nom",
    "nom_de_famille",
    "family_name",
    "surname",
  ],
  middle_name: [
    "middle_name",
    "middlename",
    "second_name",
    "secondname",
    "deuxieme_prenom",
    "postnom",
    "post_nom",
    "post_non",
    "post_name",
  ],
  first_name: [
    "first_name",
    "firstname",
    "first",
    "prenom",
    "prenon",
    "given_name",
  ],
  gender: ["gender", "sex", "sexe", "genre"],
  place_of_birth: [
    "place_of_birth",
    "lieu_de_naissance",
    "lieu_des_naissance",
    "lieu_naissance",
    "pob",
  ],
  date_of_birth: [
    "date_of_birth",
    "date_de_naissance",
    "date_de_naisasance",
    "date_naissance",
    "dob",
  ],
  class: ["class", "classe"],
  previous_school: [
    "previous_school",
    "ecole_de_provenance",
    "ecole_dorigine",
    "ecole_d_origine",
    "ecole_origine",
    "ecole_de_origine",
  ],
  parent_name: [
    "parent_name",
    "nom_du_tuteur",
    "non_du_tuteur",
    "nom_du_parent",
    "noms_du_parent",
    "name_of_parent",
    "father_name",
  ],
  parent_phone: [
    "parent_phone",
    "telephone",
    "telephone_du_parent",
    "telephone_du_tuteur",
    "telephone_parent",
    "numero_telephone_du_parent",
    "contact_phone",
    "phone",
  ],
  address: ["address", "adresse", "home_address"],
  parent_profession: [
    "parent_profession",
    "profession_du_parent",
    "profession_du_responsable",
    "profession_du_tuteur",
    "responsible_profession",
    "profession",
  ],
};

const LEGACY_OPTIONAL_ALIASES: Record<string, readonly string[]> = {
  fee_structure: ["fee_structure", "structure_tarifaire"],
  enrollment_receipt_ref: [
    "enrollment_receipt_ref",
    "numero_recu",
    "n_de_recu",
  ],
  status: ["status", "statut"],
};

const DISPLAY_HEADERS: Record<ImportLocale, Record<StudentImportHeader, string>> =
  {
    fr: {
      last_name: "Nom",
      middle_name: "Post-nom",
      first_name: "Prénom",
      gender: "Sexe",
      place_of_birth: "Lieu de naissance",
      date_of_birth: "Date de naissance",
      class: "Classe",
      previous_school: "École de provenance",
      parent_name: "Nom du tuteur",
      parent_phone: "Téléphone",
      address: "Adresse",
      parent_profession: "Profession du parent",
    },
    en: {
      last_name: "Nom",
      middle_name: "Post-nom",
      first_name: "Prénom",
      gender: "Sexe",
      place_of_birth: "Lieu de naissance",
      date_of_birth: "Date de naissance",
      class: "Classe",
      previous_school: "École de provenance",
      parent_name: "Nom du tuteur",
      parent_phone: "Téléphone",
      address: "Adresse",
      parent_profession: "Profession du parent",
    },
  };

const REQUIRED_HEADER_SET = new Set<string>(STUDENT_IMPORT_REQUIRED_HEADERS);

export function importLocaleFromApp(locale: string): ImportLocale {
  return locale.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export function getStudentImportDisplayHeaders(locale: string): string[] {
  const loc = importLocaleFromApp(locale);
  return STUDENT_IMPORT_HEADERS.map((key) => DISPLAY_HEADERS[loc][key]);
}

export function displayImportHeader(
  key: StudentImportHeader,
  locale: string
): string {
  return DISPLAY_HEADERS[importLocaleFromApp(locale)][key];
}

/** Strip BOM, accents, and punctuation so FR/EN labels map to the same key. */
export function normalizeImportHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function canonicalImportHeader(
  value: string
): StudentImportHeader | "fee_structure" | "enrollment_receipt_ref" | "status" | null {
  const normalized = normalizeImportHeader(value);
  if (!normalized) return null;

  for (const key of STUDENT_IMPORT_HEADERS) {
    if (HEADER_ALIASES[key].includes(normalized)) return key;
  }
  for (const [key, aliases] of Object.entries(LEGACY_OPTIONAL_ALIASES)) {
    if (aliases.includes(normalized)) {
      return key as "fee_structure" | "enrollment_receipt_ref" | "status";
    }
  }
  return null;
}

export function mapImportHeaders(headerRow: string[]): Record<string, number> {
  const index: Record<string, number> = {};
  headerRow.forEach((raw, i) => {
    const canonical = canonicalImportHeader(raw);
    if (canonical && index[canonical] === undefined) {
      index[canonical] = i;
    }
  });
  return index;
}

export function parseImportGender(value: string): Gender | undefined {
  const key = normalizeImportHeader(value);
  if (!key) return undefined;
  if (
    key === "m" ||
    key === "male" ||
    key === "masculin" ||
    key === "masc" ||
    key === "h" ||
    key === "homme"
  ) {
    return "male";
  }
  if (key === "f" || key === "female" || key === "feminin" || key === "femme") {
    return "female";
  }
  return undefined;
}

function detectDelimiter(headerLine: string): "," | ";" {
  const commas = (headerLine.match(/,/g) ?? []).length;
  const semis = (headerLine.match(/;/g) ?? []).length;
  return semis > commas ? ";" : ",";
}

/** RFC-style CSV parser with comma or semicolon delimiters. */
export function parseDelimitedText(text: string): string[][] {
  const cleaned = text.replace(/^\uFEFF/, "");
  const firstLineEnd = cleaned.search(/\r\n|\n|\r/);
  const headerLine =
    firstLineEnd === -1 ? cleaned : cleaned.slice(0, firstLineEnd);
  const delimiter = detectDelimiter(headerLine);

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const next = cleaned[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === delimiter) {
      row.push(field.trim());
      field = "";
      continue;
    }

    if (char === "\n" || (char === "\r" && next === "\n")) {
      row.push(field.trim());
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      field = "";
      if (char === "\r") i++;
      continue;
    }

    if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    if (row.some((cell) => cell.length > 0)) rows.push(row);
  }

  return rows;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toIsoDate(year: number, month: number, day: number): string | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/**
 * Normalize common date inputs (ISO, Excel serial, locale slash/dash formats)
 * into YYYY-MM-DD. Ambiguous D/M/Y vs M/D/Y prefers day-first when day > 12.
 */
export function normalizeImportDate(value: unknown): string | null {
  if (value == null) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return toIsoDate(
      value.getFullYear(),
      value.getMonth() + 1,
      value.getDate()
    );
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return toIsoDate(parsed.y, parsed.m, parsed.d);
  }

  const raw = String(value).trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    return toIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const slash = raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (slash) {
    const a = Number(slash[1]);
    const b = Number(slash[2]);
    const year = Number(slash[3]);
    if (a > 12 && b <= 12) return toIsoDate(year, b, a);
    if (b > 12 && a <= 12) return toIsoDate(year, a, b);
    return toIsoDate(year, b, a);
  }

  const asNumber = Number(raw);
  if (raw !== "" && Number.isFinite(asNumber) && !raw.includes("-") && !raw.includes("/")) {
    return normalizeImportDate(asNumber);
  }

  return null;
}

export function isSpreadsheetFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".xlsx") ||
    name.endsWith(".xls") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel"
  );
}

export async function readImportRowsFromFile(file: File): Promise<string[][]> {
  if (isSpreadsheetFile(file)) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<(string | number | Date | null | undefined)[]>(
      sheet,
      {
        header: 1,
        defval: "",
        raw: true,
        blankrows: false,
      }
    );

    return rows.map((row) =>
      (row ?? []).map((cell) => {
        if (cell instanceof Date) {
          return normalizeImportDate(cell) ?? "";
        }
        if (typeof cell === "number") {
          return String(cell);
        }
        return String(cell ?? "").trim();
      })
    );
  }

  const text = await file.text();
  return parseDelimitedText(text);
}

export type ClassOption = { id: string; name: string };

export function resolveImportClassId(
  value: string,
  classes: ClassOption[]
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const byId = classes.find((c) => c.id === trimmed);
  if (byId) return byId.id;

  const lower = trimmed.toLowerCase();
  const byName = classes.find((c) => c.name.toLowerCase() === lower);
  return byName?.id;
}

function exampleValues(
  locale: ImportLocale,
  exampleClassName: string
): Record<StudentImportHeader, string> {
  const className =
    exampleClassName || (locale === "fr" ? "1ère A" : "Grade 1");
  if (locale === "fr") {
    return {
      last_name: "Mwamba",
      middle_name: "Marie",
      first_name: "Jean",
      gender: "M",
      place_of_birth: "Kinshasa",
      date_of_birth: "2015-03-12",
      class: className,
      previous_school: "École Saint-Joseph",
      parent_name: "Marie Mwamba",
      parent_phone: "+243 810 000 000",
      address: "Av. Lumumba, Kinshasa",
      parent_profession: "Commerçante",
    };
  }
  return {
    last_name: "Mwamba",
    middle_name: "Marie",
    first_name: "Jean",
    gender: "M",
    place_of_birth: "Kinshasa",
    date_of_birth: "2015-03-12",
    class: className,
    previous_school: "École Saint-Joseph",
    parent_name: "Marie Mwamba",
    parent_phone: "+243 810 000 000",
    address: "Av. Lumumba, Kinshasa",
    parent_profession: "Commerçante",
  };
}

function templateCopy(locale: ImportLocale) {
  if (locale === "fr") {
    return {
      sheet: "Élèves",
      instructionsSheet: "Instructions",
      instructionHeaders: ["Colonne", "Obligatoire", "Notes"],
      yes: "Oui",
      no: "Non",
      notes: {
        last_name: "Nom de famille de l'élève (colonne Nom)",
        middle_name: "Post-nom tel qu'écrit sur la fiche (facultatif)",
        first_name: "Prénom de l'élève",
        gender: "M (masculin) ou F (féminin)",
        place_of_birth: "Ville ou lieu de naissance",
        date_of_birth: "Utiliser AAAA-MM-JJ (exemple : 2015-03-12)",
        class: "Nom exact de la classe, ou UUID",
        previous_school: "École d'où vient l'élève",
        parent_name: "Nom du tuteur ou responsable",
        parent_phone: "Numéro de téléphone du tuteur",
        address: "Adresse du foyer",
        parent_profession: "Profession du parent ou responsable",
      } satisfies Record<StudentImportHeader, string>,
      fileName: "modele-import-eleves.xlsx",
    };
  }

  return {
    sheet: "Students",
    instructionsSheet: "Instructions",
    instructionHeaders: ["Column", "Required", "Notes"],
    yes: "Yes",
    no: "No",
    notes: {
      last_name: "Family name (Nom)",
      middle_name: "Post-nom (optional)",
      first_name: "Given name (Prénom)",
      gender: "M (male) or F (female)",
      place_of_birth: "City or place of birth",
      date_of_birth: "Use YYYY-MM-DD (example: 2015-03-12)",
      class: "Exact class name from your school, or class UUID",
      previous_school: "School the student is coming from",
      parent_name: "Guardian / tutor name",
      parent_phone: "Guardian telephone number",
      address: "Home address",
      parent_profession: "Parent or guardian profession",
    } satisfies Record<StudentImportHeader, string>,
    fileName: "students-import-template.xlsx",
  };
}

/** Build an .xlsx template with required columns and one example row. */
export function buildStudentImportExcelTemplate(
  exampleClassName: string,
  locale: string = "fr"
): ArrayBuffer {
  const loc = importLocaleFromApp(locale);
  const copy = templateCopy(loc);
  const headers = getStudentImportDisplayHeaders(loc);
  const values = exampleValues(loc, exampleClassName);
  const example = STUDENT_IMPORT_HEADERS.map((key) => values[key]);

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([headers, example]);
  sheet["!cols"] = headers.map((h) => ({ wch: Math.max(16, h.length + 2) }));
  XLSX.utils.book_append_sheet(workbook, sheet, copy.sheet);

  const instructionRows = [
    copy.instructionHeaders,
    ...STUDENT_IMPORT_HEADERS.map((key) => [
      DISPLAY_HEADERS[loc][key],
      REQUIRED_HEADER_SET.has(key) ? copy.yes : copy.no,
      copy.notes[key],
    ]),
  ];
  const instructions = XLSX.utils.aoa_to_sheet(instructionRows);
  instructions["!cols"] = [{ wch: 24 }, { wch: 12 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(workbook, instructions, copy.instructionsSheet);

  return XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
}

export function downloadStudentImportExcelTemplate(
  exampleClassName: string,
  locale: string = "fr"
) {
  const loc = importLocaleFromApp(locale);
  const buffer = buildStudentImportExcelTemplate(exampleClassName, loc);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = templateCopy(loc).fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
