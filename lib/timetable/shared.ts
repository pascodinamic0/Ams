export type TimetableSlot = {
  id: string;
  class_id: string;
  day: number;
  period: number;
  subject_id: string | null;
  subject_name: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
};

/** @deprecated Use TimetableSlot */
export type TimetableSlotItem = TimetableSlot;

export type TeacherOption = {
  id: string;
  name: string | null;
};

export const TIMETABLE_DAYS = [
  { value: 1, label: "Mon", fullLabel: "Monday" },
  { value: 2, label: "Tue", fullLabel: "Tuesday" },
  { value: 3, label: "Wed", fullLabel: "Wednesday" },
  { value: 4, label: "Thu", fullLabel: "Thursday" },
  { value: 5, label: "Fri", fullLabel: "Friday" },
] as const;

export const TIMETABLE_PERIODS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const DAY_LABELS: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};
