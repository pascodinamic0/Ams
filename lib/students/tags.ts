/** Known enrollment tags editable by academic/super admins. */
export const STUDENT_TAGS = [
  "follow_up",
  "incomplete_docs",
  "fee_hold",
] as const;

export type StudentTag = (typeof STUDENT_TAGS)[number];

export function isStudentTag(value: string): value is StudentTag {
  return (STUDENT_TAGS as readonly string[]).includes(value);
}

export function normalizeStudentTags(
  tags: string[] | null | undefined
): StudentTag[] {
  if (!tags?.length) return [];
  const seen = new Set<StudentTag>();
  for (const raw of tags) {
    const key = raw.trim().toLowerCase();
    if (isStudentTag(key)) seen.add(key);
  }
  return STUDENT_TAGS.filter((t) => seen.has(t));
}
