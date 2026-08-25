export const SCHOOL_LEVELS = [
  "nursery",
  "primary",
  "secondary",
  "combined",
  "university",
  "other",
] as const;

export type SchoolLevel = (typeof SCHOOL_LEVELS)[number];

/** Levels shown in the structure wizard. Combined is expanded to primary + secondary. */
export const SELECTABLE_SCHOOL_LEVELS = [
  "nursery",
  "primary",
  "secondary",
  "university",
  "other",
] as const;

export type SelectableSchoolLevel = (typeof SELECTABLE_SCHOOL_LEVELS)[number];

export type GradePreset = {
  id: string;
  label: string;
  grade: string;
};

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

const LEVEL_ORDER: SchoolLevel[] = [
  "nursery",
  "primary",
  "secondary",
  "university",
  "other",
];

function isSchoolLevel(value: unknown): value is SchoolLevel {
  return (
    typeof value === "string" &&
    (SCHOOL_LEVELS as readonly string[]).includes(value)
  );
}

/** Combined is stored historically; treat it as primary + secondary. */
export function expandSchoolLevels(levels: SchoolLevel[]): SelectableSchoolLevel[] {
  const expanded = levels.flatMap((level) =>
    level === "combined"
      ? (["primary", "secondary"] as SelectableSchoolLevel[])
      : [level as SelectableSchoolLevel]
  );
  return LEVEL_ORDER.filter((level): level is SelectableSchoolLevel =>
    expanded.includes(level as SelectableSchoolLevel)
  );
}

export function gradesForLevels(levels: SchoolLevel[]): GradePreset[] {
  const byId = new Map<string, GradePreset>();
  for (const level of expandSchoolLevels(levels)) {
    for (const grade of GRADE_PRESETS_BY_LEVEL[level]) {
      byId.set(grade.id, grade);
    }
  }
  return [...byId.values()];
}

export function defaultGradeIdsForLevels(levels: SchoolLevel[]): string[] {
  return gradesForLevels(levels).map((g) => g.id);
}

/** Default selected grade ids when a level is first chosen. */
export function defaultGradeIdsForLevel(level: SchoolLevel): string[] {
  return defaultGradeIdsForLevels([level]);
}

export function parseStoredSchoolLevels(
  schoolLevels: unknown,
  schoolLevel: unknown
): SelectableSchoolLevel[] {
  if (Array.isArray(schoolLevels) && schoolLevels.length > 0) {
    return expandSchoolLevels(schoolLevels.filter(isSchoolLevel));
  }
  if (isSchoolLevel(schoolLevel)) {
    return expandSchoolLevels([schoolLevel]);
  }
  return [];
}
