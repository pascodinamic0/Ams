"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { saveTimetableCell, clearTimetableSlot } from "@/lib/actions/timetable";
import { toast } from "@/lib/toast";
import {
  TIMETABLE_DAYS,
  TIMETABLE_PERIODS,
  defaultTimesForPeriod,
  formatTimeRange,
  type TimetableCellEntry,
  type TimetableSlotItem,
  type TeacherOption,
} from "@/lib/timetable/shared";

type ClassOption = { id: string; name: string };
type SubjectOption = { id: string; name: string };

interface TimetableBuilderProps {
  classes: ClassOption[];
  subjects: SubjectOption[];
  teachers: TeacherOption[];
  slots: TimetableSlotItem[];
  selectedClassId: string;
}

type EditingCell = { day: number; period: number } | null;

type EntryDraft = TimetableCellEntry & { key: string };

function slotKey(day: number, period: number) {
  return `${day}-${period}`;
}

function newEntryDraft(period: number, partial?: Partial<TimetableCellEntry>): EntryDraft {
  const defaults = defaultTimesForPeriod(period);
  return {
    key: crypto.randomUUID(),
    subject_id: partial?.subject_id ?? null,
    teacher_id: partial?.teacher_id ?? null,
    start_time: partial?.start_time ?? defaults.start,
    end_time: partial?.end_time ?? defaults.end,
  };
}

function slotsToDrafts(cellSlots: TimetableSlotItem[], period: number): EntryDraft[] {
  if (cellSlots.length === 0) return [newEntryDraft(period)];
  return cellSlots.map((slot) =>
    newEntryDraft(period, {
      id: slot.id,
      subject_id: slot.subject_id,
      teacher_id: slot.teacher_id,
      start_time: slot.start_time,
      end_time: slot.end_time,
    })
  );
}

function DraggableSubject({ subject }: { subject: SubjectOption }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `subject-${subject.id}`,
    data: { subjectId: subject.id, subjectName: subject.name },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-lg border border-primary-200 bg-primary-light px-3 py-1.5 text-sm font-medium text-teal-800 active:cursor-grabbing dark:border-primary-800 dark:bg-primary-light/50 dark:text-teal-200 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      {subject.name}
    </button>
  );
}

function TimetableCell({
  day,
  period,
  cellSlots,
  onEdit,
  clickOrDropLabel,
}: {
  day: number;
  period: number;
  cellSlots: TimetableSlotItem[];
  onEdit: () => void;
  clickOrDropLabel: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${day}-${period}`,
    data: { day, period },
  });

  const filled = cellSlots.some((s) => s.subject_name || s.teacher_name);

  return (
    <td className="border border-stone-200 p-1 dark:border-stone-700">
      <button
        ref={setNodeRef}
        type="button"
        onClick={onEdit}
        className={`flex min-h-[72px] w-full min-w-[110px] flex-col items-start justify-start gap-1 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
          isOver
            ? "bg-primary-light ring-2 ring-primary-400 dark:bg-primary-light/40"
            : filled
              ? "bg-white hover:bg-stone-50 dark:bg-stone-900 dark:hover:bg-stone-800"
              : "bg-stone-50 text-stone-400 hover:bg-stone-100 dark:bg-stone-800/50 dark:hover:bg-stone-800"
        }`}
      >
        {filled ? (
          cellSlots.map((slot) => (
            <div key={slot.id} className="w-full border-b border-stone-100 pb-1 last:border-0 last:pb-0 dark:border-stone-800">
              {formatTimeRange(slot.start_time, slot.end_time) && (
                <span className="text-[10px] font-medium uppercase tracking-wide text-primary dark:text-primary">
                  {formatTimeRange(slot.start_time, slot.end_time)}
                </span>
              )}
              <span className="block font-medium text-stone-900 dark:text-stone-100">
                {slot.subject_name ?? "-"}
              </span>
              {slot.teacher_name && (
                <span className="text-xs text-stone-500">{slot.teacher_name}</span>
              )}
            </div>
          ))
        ) : (
          <span className="text-xs">{clickOrDropLabel}</span>
        )}
      </button>
    </td>
  );
}

export function TimetableBuilder({
  classes,
  subjects,
  teachers,
  slots,
  selectedClassId,
}: TimetableBuilderProps) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<EditingCell>(null);
  const [entries, setEntries] = useState<EntryDraft[]>([]);
  const [activeSubject, setActiveSubject] = useState<SubjectOption | null>(null);

  const slotsByCell = new Map<string, TimetableSlotItem[]>();
  for (const slot of slots) {
    const key = slotKey(slot.day, slot.period);
    const list = slotsByCell.get(key) ?? [];
    list.push(slot);
    slotsByCell.set(key, list);
  }

  function handleClassChange(classId: string) {
    const params = new URLSearchParams();
    if (classId) params.set("class", classId);
    router.push(`/academic/timetable?${params.toString()}`);
  }

  function openEditor(day: number, period: number) {
    const cellSlots = slotsByCell.get(slotKey(day, period)) ?? [];
    setEditing({ day, period });
    setEntries(slotsToDrafts(cellSlots, period));
  }

  async function persistCell(
    day: number,
    period: number,
    cellEntries: EntryDraft[]
  ) {
    startTransition(async () => {
      const result = await saveTimetableCell({
        class_id: selectedClassId,
        day,
        period,
        entries: cellEntries.map(({ key: _key, ...entry }) => entry),
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t("timetableUpdated"));
      setEditing(null);
      router.refresh();
    });
  }

  async function handleSave() {
    if (!editing) return;
    await persistCell(editing.day, editing.period, entries);
  }

  async function handleClear() {
    if (!editing) return;
    startTransition(async () => {
      const result = await clearTimetableSlot(
        selectedClassId,
        editing.day,
        editing.period
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t("slotCleared"));
      setEditing(null);
      router.refresh();
    });
  }

  function updateEntry(key: string, patch: Partial<EntryDraft>) {
    setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, ...patch } : e)));
  }

  function addEntry() {
    if (!editing) return;
    setEntries((prev) => [...prev, newEntryDraft(editing.period)]);
  }

  function removeEntry(key: string) {
    setEntries((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((e) => e.key !== key);
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { subjectId?: string; subjectName?: string } | undefined;
    if (data?.subjectId && data.subjectName) {
      setActiveSubject({ id: data.subjectId, name: data.subjectName });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveSubject(null);
    const { active, over } = event;
    if (!over || !selectedClassId) return;

    const overId = String(over.id);
    if (!overId.startsWith("cell-")) return;

    const [, dayStr, periodStr] = overId.split("-");
    const day = Number(dayStr);
    const period = Number(periodStr);
    const data = active.data.current as { subjectId?: string } | undefined;
    if (!data?.subjectId) return;

    const cellSlots = slotsByCell.get(slotKey(day, period)) ?? [];
    const drafts = slotsToDrafts(cellSlots, period);
    const hasContent = drafts.some((d) => d.subject_id || d.teacher_id);
    const nextEntries = hasContent
      ? [...drafts, newEntryDraft(period, { subject_id: data.subjectId })]
      : [newEntryDraft(period, { subject_id: data.subjectId })];

    void persistCell(day, period, nextEntries);
  }

  const editingDay = editing
    ? TIMETABLE_DAYS.find((d) => d.value === editing.day)
  : null;

  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("timetableTitle")}</h1>
        <EmptyState
          title={t("noClassesYet")}
          description={t("createClassesFirst")}
        />
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("timetableTitle")}</h1>
            <p className="mt-1 text-sm text-stone-500">
              {t("timetableDescription")}
            </p>
          </div>
          <div className="w-full sm:w-64">
            <Label htmlFor="class-select">{t("class")}</Label>
            <select
              id="class-select"
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {subjects.length > 0 && (
          <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-700">
            <p className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">
              {t("dragSubjects")}
            </p>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <DraggableSubject key={s.id} subject={s} />
              ))}
            </div>
          </div>
        )}

        {subjects.length === 0 && (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t("addSubjectsTimetableHint")}
          </p>
        )}

        <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr className="bg-stone-100 dark:bg-stone-800">
                <th className="border border-stone-200 px-3 py-2 text-left font-medium dark:border-stone-700">
                  {t("period")}
                </th>
                {TIMETABLE_DAYS.map((d) => (
                  <th
                    key={d.value}
                    className="border border-stone-200 px-3 py-2 text-left font-medium dark:border-stone-700"
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMETABLE_PERIODS.map((period) => {
                const periodTimes = defaultTimesForPeriod(period);
                return (
                  <tr key={period}>
                    <td className="border border-stone-200 bg-stone-50 px-3 py-2 dark:border-stone-700 dark:bg-stone-800/50">
                      <span className="block font-medium text-stone-600 dark:text-stone-400">
                        {period}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-stone-400">
                        {formatTimeRange(periodTimes.start, periodTimes.end)}
                      </span>
                    </td>
                    {TIMETABLE_DAYS.map((d) => (
                      <TimetableCell
                        key={d.value}
                        day={d.value}
                        period={period}
                        cellSlots={slotsByCell.get(slotKey(d.value, period)) ?? []}
                        onEdit={() => openEditor(d.value, period)}
                        clickOrDropLabel={t("clickOrDrop")}
                      />
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DragOverlay>
        {activeSubject ? (
          <span className="rounded-lg border border-primary-300 bg-primary-light px-3 py-1.5 text-sm font-medium text-teal-900 shadow-lg">
            {activeSubject.name}
          </span>
        ) : null}
      </DragOverlay>

      <Modal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title={
          editing
            ? t("periodTitle", { period: editing.period, day: editingDay?.fullLabel ?? "" })
            : undefined
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-500">
            {t("periodModalDesc")}
          </p>

          <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
            {entries.map((entry, index) => (
              <div
                key={entry.key}
                className="rounded-lg border border-stone-200 p-3 dark:border-stone-700"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {t("lesson", { number: index + 1 })}
                  </span>
                  {entries.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-red-600 hover:text-red-700"
                      onClick={() => removeEntry(entry.key)}
                    >
                      {tc("remove")}
                    </Button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor={`start-${entry.key}`}>{t("startTime")}</Label>
                    <input
                      id={`start-${entry.key}`}
                      type="time"
                      value={entry.start_time ?? ""}
                      onChange={(e) =>
                        updateEntry(entry.key, { start_time: e.target.value || null })
                      }
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`end-${entry.key}`}>{t("endTime")}</Label>
                    <input
                      id={`end-${entry.key}`}
                      type="time"
                      value={entry.end_time ?? ""}
                      onChange={(e) =>
                        updateEntry(entry.key, { end_time: e.target.value || null })
                      }
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <Label htmlFor={`subject-${entry.key}`}>{t("subject")}</Label>
                  <select
                    id={`subject-${entry.key}`}
                    value={entry.subject_id ?? ""}
                    onChange={(e) =>
                      updateEntry(entry.key, { subject_id: e.target.value || null })
                    }
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
                  >
                    <option value="">{t("none")}</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3">
                  <Label htmlFor={`teacher-${entry.key}`}>{t("teacher")}</Label>
                  <select
                    id={`teacher-${entry.key}`}
                    value={entry.teacher_id ?? ""}
                    onChange={(e) =>
                      updateEntry(entry.key, { teacher_id: e.target.value || null })
                    }
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
                  >
                    <option value="">{t("none")}</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name ?? t("unnamed")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" size="sm" onClick={addEntry}>
            {t("addAnotherSubject")}
          </Button>

          <div className="flex flex-wrap gap-2 border-t border-stone-200 pt-4 dark:border-stone-700">
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {t("savePeriod")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isPending}
            >
              {t("clearPeriod")}
            </Button>
          </div>
        </div>
      </Modal>
    </DndContext>
  );
}
