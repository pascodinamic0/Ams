import type { ClassListItem, PublicClassListItem } from "@/lib/db/classes";

type ClassCapacityFields = {
  student_count: number;
  capacity: number | null;
  is_full?: boolean;
  seats_remaining?: number | null;
};

export function formatClassOptionLabel(
  cls: Pick<ClassListItem | PublicClassListItem, "name" | "student_count" | "capacity">
): string {
  if (cls.capacity != null) {
    return `${cls.name} (${cls.student_count}/${cls.capacity})`;
  }
  return cls.name;
}

export function isClassFull(cls: ClassCapacityFields): boolean {
  if (cls.is_full != null) return cls.is_full;
  return cls.capacity != null && cls.student_count >= cls.capacity;
}

export function seatsRemaining(cls: ClassCapacityFields): number | null {
  if (cls.seats_remaining != null) return cls.seats_remaining;
  if (cls.capacity == null) return null;
  return Math.max(0, cls.capacity - cls.student_count);
}
