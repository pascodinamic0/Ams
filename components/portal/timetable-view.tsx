import { DAY_LABELS, formatTimeRange, type TimetableSlot } from "@/lib/timetable/shared";

const WEEKDAYS = [1, 2, 3, 4, 5] as const;

interface TimetableViewProps {
  slots: TimetableSlot[];
  title?: string;
}

function groupSlotsByCell(slots: TimetableSlot[]): Map<string, TimetableSlot[]> {
  const byCell = new Map<string, TimetableSlot[]>();
  for (const slot of slots) {
    const key = `${slot.day}-${slot.period}`;
    const list = byCell.get(key) ?? [];
    list.push(slot);
    byCell.set(key, list);
  }
  for (const [, list] of byCell) {
    list.sort((a, b) => {
      const aStart = a.start_time ?? "";
      const bStart = b.start_time ?? "";
      return aStart.localeCompare(bStart);
    });
  }
  return byCell;
}

export function TimetableView({ slots, title }: TimetableViewProps) {
  const byCell = groupSlotsByCell(slots);
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
                  const cellSlots = byCell.get(`${day}-${period}`) ?? [];
                  return (
                    <td key={day} className="px-3 py-2 align-top">
                      {cellSlots.length > 0 ? (
                        <div className="space-y-2">
                          {cellSlots.map((slot) => (
                            <div key={slot.id}>
                              {formatTimeRange(slot.start_time, slot.end_time) && (
                                <p className="text-[10px] font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                                  {formatTimeRange(slot.start_time, slot.end_time)}
                                </p>
                              )}
                              <p className="font-medium text-slate-900 dark:text-white">
                                {slot.subject_name ?? "-"}
                              </p>
                              {slot.teacher_name && (
                                <p className="text-xs text-slate-500">{slot.teacher_name}</p>
                              )}
                            </div>
                          ))}
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
