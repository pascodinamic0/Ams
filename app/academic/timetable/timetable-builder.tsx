"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { upsertTimetableSlot, clearTimetableSlot } from "@/lib/actions/timetable";
import { toast } from "@/lib/toast";
import {
  TIMETABLE_DAYS,
  TIMETABLE_PERIODS,
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

function slotKey(day: number, period: number) {
  return `${day}-${period}`;
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
      className={`cursor-grab rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-800 active:cursor-grabbing dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200 ${
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
  slot,
  onEdit,
}: {
  day: number;
  period: number;
  slot: TimetableSlotItem | undefined;
  onEdit: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${day}-${period}`,
    data: { day, period },
  });

  const filled = Boolean(slot?.subject_name || slot?.teacher_name);

  return (
    <td className="border border-slate-200 p-1 dark:border-slate-700">
      <button
        ref={setNodeRef}
        type="button"
        onClick={onEdit}
        className={`flex min-h-[72px] w-full min-w-[110px] flex-col items-start justify-center rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
          isOver
            ? "bg-indigo-100 ring-2 ring-indigo-400 dark:bg-indigo-900/40"
            : filled
              ? "bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
              : "bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
        }`}
      >
        {filled ? (
          <>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {slot?.subject_name ?? "-"}
            </span>
            {slot?.teacher_name && (
              <span className="mt-0.5 text-xs text-slate-500">{slot.teacher_name}</span>
            )}
          </>
        ) : (
          <span className="text-xs">Click or drop</span>
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<EditingCell>(null);
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [activeSubject, setActiveSubject] = useState<SubjectOption | null>(null);

  const slotMap = new Map(slots.map((s) => [slotKey(s.day, s.period), s]));

  function handleClassChange(classId: string) {
    const params = new URLSearchParams();
    if (classId) params.set("class", classId);
    router.push(`/academic/timetable?${params.toString()}`);
  }

  function openEditor(day: number, period: number) {
    const slot = slotMap.get(slotKey(day, period));
    setEditing({ day, period });
    setSubjectId(slot?.subject_id ?? "");
    setTeacherId(slot?.teacher_id ?? "");
  }

  async function saveSlot(day: number, period: number, subjId: string | null, teachId: string | null) {
    startTransition(async () => {
      const result = await upsertTimetableSlot({
        class_id: selectedClassId,
        day,
        period,
        subject_id: subjId,
        teacher_id: teachId,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Timetable updated");
      setEditing(null);
      router.refresh();
    });
  }

  async function handleSave() {
    if (!editing) return;
    await saveSlot(
      editing.day,
      editing.period,
      subjectId || null,
      teacherId || null
    );
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
      toast.success("Slot cleared");
      setEditing(null);
      router.refresh();
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

    const existing = slotMap.get(slotKey(day, period));
    void saveSlot(day, period, data.subjectId, existing?.teacher_id ?? null);
  }

  const editingDay = editing
    ? TIMETABLE_DAYS.find((d) => d.value === editing.day)
  : null;

  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Timetable</h1>
        <EmptyState
          title="No classes yet"
          description="Create classes first, then build a weekly timetable for each class."
        />
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Timetable</h1>
            <p className="mt-1 text-sm text-slate-500">
              Build weekly schedules per class. Drag subjects onto slots or click a cell to edit.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <Label htmlFor="class-select">Class</Label>
            <select
              id="class-select"
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
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
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              Drag subjects into the grid
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
            Add subjects under Academic ? Subjects before filling the timetable.
          </p>
        )}

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800">
                <th className="border border-slate-200 px-3 py-2 text-left font-medium dark:border-slate-700">
                  Period
                </th>
                {TIMETABLE_DAYS.map((d) => (
                  <th
                    key={d.value}
                    className="border border-slate-200 px-3 py-2 text-left font-medium dark:border-slate-700"
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMETABLE_PERIODS.map((period) => (
                <tr key={period}>
                  <td className="border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                    {period}
                  </td>
                  {TIMETABLE_DAYS.map((d) => (
                    <TimetableCell
                      key={d.value}
                      day={d.value}
                      period={period}
                      slot={slotMap.get(slotKey(d.value, period))}
                      onEdit={() => openEditor(d.value, period)}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DragOverlay>
        {activeSubject ? (
          <span className="rounded-lg border border-indigo-300 bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-900 shadow-lg">
            {activeSubject.name}
          </span>
        ) : null}
      </DragOverlay>

      <Modal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title={
          editing
            ? `Period ${editing.period} - ${editingDay?.fullLabel ?? ""}`
            : undefined
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="slot-subject">Subject</Label>
            <select
              id="slot-subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">None</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="slot-teacher">Teacher</Label>
            <select
              id="slot-teacher"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">None</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name ?? "Unnamed"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" onClick={handleSave} disabled={isPending}>
              Save slot
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isPending}
            >
              Clear slot
            </Button>
          </div>
        </div>
      </Modal>
    </DndContext>
  );
}
