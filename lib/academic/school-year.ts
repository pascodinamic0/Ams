/**
 * DRC (RD Congo) academic years run roughly Sept-July and are labeled in pairs
 * (e.g. "2026 - 2027"), matching MINEDU-NC / EPST calendars.
 *
 * Storage convention: integer start calendar year (2026 for "2026 - 2027").
 * Use these helpers everywhere school/academic years appear in the app.
 * Keep plain calendar years for payroll months, DOB, receipts, and chart axes.
 */

/** September (1-based). School year Y-(Y+1) starts in this month. */
export const SCHOOL_YEAR_START_MONTH = 9;

export function formatSchoolYear(startYear: number): string {
  return `${startYear} - ${startYear + 1}`;
}

/** Start year of the school year schools are planning for on a given date. */
export function getCurrentSchoolYearStart(date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  // Jan-Jul: still in the year that began the previous September
  // Aug-Dec: budgeting / rentree for the year that starts this September
  return month >= 7 ? year : year - 1;
}

/** Select options around a center start year (newest first). */
export function schoolYearOptions(
  centerStartYear = getCurrentSchoolYearStart(),
  before = 3,
  after = 4
): { value: number; label: string }[] {
  const start = centerStartYear - before;
  const end = centerStartYear + after;
  const options: { value: number; label: string }[] = [];
  for (let y = end; y >= start; y -= 1) {
    options.push({ value: y, label: formatSchoolYear(y) });
  }
  return options;
}

export type SchoolYearMonthOption = {
  /** Stored as YYYY-MM */
  value: string;
  label: string;
  month: number;
  calendarYear: number;
};

/**
 * Months in a DRC school year: Sept (start) through Aug (start+1).
 * Labels use English month names; pass a localize fn when needed.
 */
export function schoolYearMonthOptions(
  startYear: number,
  monthNames: readonly string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
): SchoolYearMonthOption[] {
  const options: SchoolYearMonthOption[] = [];
  for (let i = 0; i < 12; i += 1) {
    const month = ((SCHOOL_YEAR_START_MONTH - 1 + i) % 12) + 1;
    const calendarYear = month >= SCHOOL_YEAR_START_MONTH ? startYear : startYear + 1;
    options.push({
      value: `${calendarYear}-${String(month).padStart(2, "0")}`,
      label: `${monthNames[month - 1]} ${calendarYear}`,
      month,
      calendarYear,
    });
  }
  return options;
}

/** Resolve school-year start from a calendar date (YYYY-MM-DD or Date). */
export function schoolYearStartFromDate(input: Date | string): number {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return getCurrentSchoolYearStart();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= SCHOOL_YEAR_START_MONTH ? year : year - 1;
}

/** Combine school year + term for display keys, e.g. "2026 - 2027 / T1". */
export function formatSchoolYearPeriod(startYear: number, term: string): string {
  return `${formatSchoolYear(startYear)} / ${term}`;
}

/** Parse keys from `formatSchoolYearPeriod`. Falls back to raw term. */
export function parseSchoolYearPeriod(key: string): {
  schoolYear: number | null;
  term: string;
} {
  // Accept " / " and older middle-dot separators via unicode escapes only.
  const match = key.match(
    new RegExp(`^(\\d{4})\\s*-\\s*(\\d{4})\\s*(?:\\/|\\u00b7|\\u2022)\\s*(.+)$`)
  );
  if (!match) return { schoolYear: null, term: key };
  return { schoolYear: Number(match[1]), term: match[3].trim() };
}
