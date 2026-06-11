export type TimetableSlot = {
  id: string;
  class_id: string;
  day: number;
  period: number;
  subject_id: string | null;
  subject_name: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
  start_time: string | null;
  end_time: string | null;
};

export type TimetableCellEntry = {
  id?: string;
  subject_id: string | null;
  teacher_id: string | null;
  start_time: string | null;
  end_time: string | null;
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

/** Suggested bell times when adding a slot (24h HH:MM). Schools can override per entry. */
export const DEFAULT_PERIOD_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: "08:00", end: "08:45" },
  2: { start: "08:50", end: "09:35" },
  3: { start: "09:40", end: "10:25" },
  4: { start: "10:40", end: "11:25" },
  5: { start: "11:30", end: "12:15" },
  6: { start: "13:00", end: "13:45" },
  7: { start: "13:50", end: "14:35" },
  8: { start: "14:40", end: "15:25" },
};

export function defaultTimesForPeriod(period: number): { start: string; end: string } {
  return DEFAULT_PERIOD_TIMES[period] ?? { start: "08:00", end: "09:00" };
}

export function formatTimetableTime(time: string | null): string | null {
  if (!time) return null;
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const period = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatTimeRange(start: string | null, end: string | null): string | null {
  const startLabel = formatTimetableTime(start);
  const endLabel = formatTimetableTime(end);
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
  return startLabel ?? endLabel;
}

export const DAY_LABELS: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};
