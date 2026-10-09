export type CollectionCycle = "monthly" | "trimester";

/** True on the invoice due day of each later month, or each later trimester. */
export function isRepeatReminderDay(
  dueDate: Date,
  today: Date,
  cycle: CollectionCycle
): boolean {
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const now = new Date(today);
  now.setHours(0, 0, 0, 0);
  if (now.getTime() <= due.getTime()) return false;

  const months =
    (now.getFullYear() - due.getFullYear()) * 12 +
    (now.getMonth() - due.getMonth());
  if (months < 1) return false;
  if (cycle === "trimester" && months % 3 !== 0) return false;

  const dueDay = due.getDate();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return now.getDate() === Math.min(dueDay, lastDay);
}
