"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { saveAttendance, markAllPresent } from "@/lib/actions/attendance";
import { toast } from "@/lib/toast";
import type { AttendanceRecordItem } from "@/lib/db";

interface Props {
  classes: { id: string; name: string }[];
  initialClassId: string;
  initialDate: string;
  records: AttendanceRecordItem[];
}

export function AttendanceSheet({ classes, initialClassId, initialDate, records }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState(() => new Date(initialDate + "T12:00:00"));
  const [statuses, setStatuses] = useState<Record<string, "present" | "absent">>(() =>
    Object.fromEntries(records.map((r) => [r.student_id, r.status]))
  );

  const classId = searchParams.get("class") ?? initialClassId;
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/teacher/attendance?${params.toString()}`);
  }

  function toggleStatus(studentId: string) {
    setStatuses((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present",
    }));
  }

  async function handleSave() {
    startTransition(async () => {
      const result = await saveAttendance({
        class_id: classId,
        date: dateStr,
        records: records.map((r) => ({
          student_id: r.student_id,
          date: dateStr,
          status: statuses[r.student_id] ?? "present",
        })),
      });
      if (result.error) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to save attendance");
        return;
      }
      toast.success("Attendance saved");
      router.refresh();
    });
  }

  async function handleMarkAllPresent() {
    startTransition(async () => {
      const result = await markAllPresent(classId, dateStr);
      if (result.error) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to mark all present");
        return;
      }
      setStatuses(Object.fromEntries(records.map((r) => [r.student_id, "present" as const])));
      toast.success("All students marked present");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <Label htmlFor="class-select">Class</Label>
          <select
            id="class-select"
            value={classId}
            onChange={(e) => updateParams("class", e.target.value)}
            className="mt-1 w-full min-w-[180px] rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Date</Label>
          <div className="mt-1">
            <DatePicker
              value={selectedDate}
              onChange={(d) => {
                if (d) {
                  setSelectedDate(d);
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("date", format(d, "yyyy-MM-dd"));
                  router.push(`/teacher/attendance?${params.toString()}`);
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={handleSave} disabled={pending || !classId}>
          Save attendance
        </Button>
        <Button size="sm" variant="outline" onClick={handleMarkAllPresent} disabled={pending || !classId}>
          Mark all present
        </Button>
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-slate-500">No students in this class.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Student</th>
                <th className="px-4 py-2 text-left font-medium">ID</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const status = statuses[r.student_id] ?? r.status;
                return (
                  <tr key={r.student_id} className="border-t dark:border-slate-700">
                    <td className="px-4 py-2">{r.student_name}</td>
                    <td className="px-4 py-2 text-slate-500">{r.student_number ?? "—"}</td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => toggleStatus(r.student_id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          status === "present"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                        }`}
                      >
                        {status === "present" ? "Present" : "Absent"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
