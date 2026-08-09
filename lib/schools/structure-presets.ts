export const SCHOOL_LEVELS = [
  "nursery",
  "primary",
  "secondary",
  "combined",
  "university",
  "other",
] as const;

export type SchoolLevel = (typeof SCHOOL_LEVELS)[number];

/** Levels users can pick in the structure wizard (multi-select). */
export const SELECTABLE_SCHOOL_LEVELS = [
  "nursery",
  "primary",
  "secondary",
  "university",
  "other",
] as const satisfies readonly SchoolLevel[];

export type SelectableSchoolLevel = (typeof SELECTABLE_SCHOOL_LEVELS)[number];

export type GradePreset = {
  id: string;
  label: string;
  grade: string;
};

const LEVEL_ORDER = new Map(
  SCHOOL_LEVELS.map((level, index) => [level, index] as const)
);

/** Expand legacy `combined` into primary + secondary for multi-select UI. */
export function expandSchoolLevels(
  levels: SchoolLevel[] | null | undefined,
  fallback?: SchoolLevel | null
): SchoolLevel[] {
  const raw =
    levels && levels.length > 0
      ? levels
      : fallback
        ? [fallback]
        : [];

  const expanded = raw.flatMap((level) =>
    level === "combined"
      ? (["primary", "secondary"] as SchoolLevel[])
      : [level]
  );

  return orderSchoolLevels(expanded);
}

export function orderSchoolLevels(levels: SchoolLevel[]): SchoolLevel[] {
  return [...new Set(levels)].sort(
    (a, b) => (LEVEL_ORDER.get(a) ?? 99) - (LEVEL_ORDER.get(b) ?? 99)
  );
}

/** Single-column summary kept for older readers of `schools.school_level`. */
export function derivePrimarySchoolLevel(levels: SchoolLevel[]): SchoolLevel {
  const ordered = orderSchoolLevels(
    levels.flatMap((level) =>
      level === "combined"
        ? (["primary", "secondary"] as SchoolLevel[])
        : [level]
    )
  );

  if (ordered.length === 0) return "other";
  if (ordered.length === 1) return ordered[0]!;

  const onlyPrimarySecondary =
    ordered.length === 2 &&
    ordered.includes("primary") &&
    ordered.includes("secondary");

  if (onlyPrimarySecondary) return "combined";
  return ordered[0]!;
}

export const SECTION_LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
] as const;

export type SectionLetter = (typeof SECTION_LETTERS)[number];

const NURSERY_GRADES: GradePreset[] = [
  { id: "nursery-1", label: "Nursery 1", grade: "Nursery 1" },
  { id: "nursery-2", label: "Nursery 2", grade: "Nursery 2" },
  { id: "nursery-3", label: "Nursery 3", grade: "Nursery 3" },
  { id: "kindergarten", label: "Kindergarten", grade: "Kindergarten" },
];

const PRIMARY_GRADES: GradePreset[] = [
  { id: "primary-1", label: "Primary 1", grade: "Primary 1" },
  { id: "primary-2", label: "Primary 2", grade: "Primary 2" },
  { id: "primary-3", label: "Primary 3", grade: "Primary 3" },
  { id: "primary-4", label: "Primary 4", grade: "Primary 4" },
  { id: "primary-5", label: "Primary 5", grade: "Primary 5" },
  { id: "primary-6", label: "Primary 6", grade: "Primary 6" },
];

const SECONDARY_GRADES: GradePreset[] = [
  { id: "form-1", label: "Form 1", grade: "Form 1" },
  { id: "form-2", label: "Form 2", grade: "Form 2" },
  { id: "form-3", label: "Form 3", grade: "Form 3" },
  { id: "form-4", label: "Form 4", grade: "Form 4" },
  { id: "form-5", label: "Form 5", grade: "Form 5" },
  { id: "form-6", label: "Form 6", grade: "Form 6" },
];

const UNIVERSITY_GRADES: GradePreset[] = [
  { id: "year-1", label: "Year 1", grade: "Year 1" },
  { id: "year-2", label: "Year 2", grade: "Year 2" },
  { id: "year-3", label: "Year 3", grade: "Year 3" },
  { id: "year-4", label: "Year 4", grade: "Year 4" },
];

export const GRADE_PRESETS_BY_LEVEL: Record<SchoolLevel, GradePreset[]> = {
  nursery: NURSERY_GRADES,
  primary: PRIMARY_GRADES,
  secondary: SECONDARY_GRADES,
  combined: [...PRIMARY_GRADES, ...SECONDARY_GRADES.slice(0, 4)],
  university: UNIVERSITY_GRADES,
  other: [],
};

export function gradePresetsForLevels(levels: SchoolLevel[]): GradePreset[] {
  const seen = new Set<string>();
  const presets: GradePreset[] = [];

  for (const level of orderSchoolLevels(levels)) {
    for (const grade of GRADE_PRESETS_BY_LEVEL[level]) {
      if (seen.has(grade.id)) continue;
      seen.add(grade.id);
      presets.push(grade);
    }
  }

  return presets;
}

export function defaultGradeIdsForLevels(levels: SchoolLevel[]): string[] {
  return gradePresetsForLevels(levels).map((grade) => grade.id);
}

/** Default selected grade ids when a level is first chosen. */
export function defaultGradeIdsForLevel(level: SchoolLevel): string[] {
  return GRADE_PRESETS_BY_LEVEL[level].map((g) => g.id);
}

export function buildClassName(grade: string, section: string): string {
  return `${grade} - ${section}`;
}

export function countPlannedClasses(
  grades: string[],
  sections: string[]
): number {
  return grades.length * sections.length;
}
