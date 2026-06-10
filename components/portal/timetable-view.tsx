import { DAY_LABELS, type TimetableSlot } from "@/lib/timetable/shared";

const WEEKDAYS = [1, 2, 3, 4, 5] as const;

interface TimetableViewProps {
  slots: TimetableSlot[];
  title?: string;
}

export function TimetableView({ slots, title }: TimetableViewProps) {
  const byDay = new Map<number, TimetableSlot[]>();
  for (const slot of slots) {
    const list = byDay.get(slot.day) ?? [];
    list.push(slot);
    byDay.set(slot.day, list);
  }
  for (const [, list] of byDay) {
    list.sort((a, b) => a.period - b.period);
  }

  const maxPeriod = slots.reduce((max, s) => Math.max(max, s.period), 0);

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-sm text-slate-500">No timetable has been set up yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {title && (
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-3 py-2 text-left font-medium text-slate-500">Period</th>
              {WEEKDAYS.map((day) => (
                <th key={day} className="px-3 py-2 text-left font-medium text-slate-500">
                  {DAY_LABELS[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxPeriod }, (_, i) => i + 1).map((period) => (
              <tr key={period} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-3 py-2 font-medium text-slate-600 dark:text-slate-300">
                  {period}
                </td>
                {WEEKDAYS.map((day) => {
                  const slot = byDay.get(day)?.find((s) => s.period === period);
                  return (
                    <td key={day} className="px-3 py-2 align-top">
                      {slot ? (
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {slot.subject_name ?? "-"}
                          </p>
                          {slot.teacher_name && (
                            <p className="text-xs text-slate-500">{slot.teacher_name}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
