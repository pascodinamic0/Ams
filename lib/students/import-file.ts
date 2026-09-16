import * as XLSX from "xlsx";

export const STUDENT_IMPORT_HEADERS = [
  "first_name",
  "middle_name",
  "last_name",
  "date_of_birth",
  "class",
  "fee_structure",
  "enrollment_receipt_ref",
  "status",
] as const;

export const STUDENT_IMPORT_REQUIRED_HEADERS = [
  "first_name",
  "last_name",
  "date_of_birth",
  "class",
] as const;

export type StudentImportHeader = (typeof STUDENT_IMPORT_HEADERS)[number];

/** Strip BOM and normalize header labels from CSV/Excel. */
export function normalizeImportHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
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
    // Excel serial date (days since 1899-12-30)
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
    // Prefer day-first when first part looks like a day (>12)
    if (a > 12 && b <= 12) return toIsoDate(year, b, a);
    if (b > 12 && a <= 12) return toIsoDate(year, a, b);
    // Default to day-first (common for school locales outside the US)
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
          // Prefer date normalization for numeric DOB cells; otherwise stringify
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

/** Build an .xlsx template with required columns and one example row. */
export function buildStudentImportExcelTemplate(
  exampleClassName: string
): ArrayBuffer {
  const headers = [...STUDENT_IMPORT_HEADERS];
  const example = [
    "Jane",
    "Marie",
    "Doe",
    "2015-03-12",
    exampleClassName || "Grade 1",
    "",
    "",
    "pending",
  ];

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet([headers, example]);
  sheet["!cols"] = [
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(workbook, sheet, "Students");

  const instructions = XLSX.utils.aoa_to_sheet([
    ["Column", "Required", "Notes"],
    ["first_name", "Yes", "Student given name"],
    ["middle_name", "No", "Optional middle name"],
    ["last_name", "Yes", "Student family name"],
    ["date_of_birth", "Yes", "Use YYYY-MM-DD (example: 2015-03-12)"],
    ["class", "Yes", "Exact class name from your school, or class UUID"],
    [
      "fee_structure",
      "No",
      "Fee structure name or UUID. If omitted, the class must have exactly one applicable fee.",
    ],
    [
      "enrollment_receipt_ref",
      "No",
      "Paper receipt number from the manual facture book (optional)",
    ],
    [
      "status",
      "No",
      "Ignored on import — all rows are created as pending until finance confirms payment",
    ],
  ]);
  instructions["!cols"] = [{ wch: 16 }, { wch: 10 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(workbook, instructions, "Instructions");

  return XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
}

export function downloadStudentImportExcelTemplate(exampleClassName: string) {
  const buffer = buildStudentImportExcelTemplate(exampleClassName);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "students-import-template.xlsx";
  anchor.click();
  URL.revokeObjectURL(url);
}
