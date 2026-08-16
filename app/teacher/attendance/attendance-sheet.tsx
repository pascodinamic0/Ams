"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { saveAttendance, markAllPresent } from "@/lib/actions/attendance";
import { queueAttendanceSave } from "@/lib/pwa/attendance-offline";
import { toast } from "@/lib/toast";
import { LessonMaterialModal } from "./lesson-material-modal";
import type { AttendanceRecordItem, TeacherLessonMaterialSummary } from "@/lib/db";
import type { TeacherSubjectOption } from "@/lib/db/lesson-materials";

interface Props {
  classes: { id: string; name: string }[];
  initialClassId: string;
  initialDate: string;
  records: AttendanceRecordItem[];
  subjects: TeacherSubjectOption[];
  sentMaterials: TeacherLessonMaterialSummary[];
  schoolId: string | null;
  teacherId: string;
}

export function AttendanceSheet({
  classes,
  initialClassId,
  initialDate,
  records,
  subjects,
  sentMaterials,
  schoolId,
  teacherId,
}: Props) {
  const t = useTranslations("teacher");
  const tc = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [attendanceSaved, setAttendanceSaved] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date(initialDate + "T12:00:00"));
  const [statuses, setStatuses] = useState<Record<string, "present" | "absent">>(() =>
    Object.fromEntries(records.map((r) => [r.student_id, r.status]))
  );

  const classId = searchParams.get("class") ?? initialClassId;
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const absentStudentIds = useMemo(
    () =>
      records
        .filter((r) => (statuses[r.student_id] ?? r.status) === "absent")
        .map((r) => r.student_id),
    [records, statuses]
  );

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/teacher/attendance?${params.toString()}`);
  }

  function toggleStatus(studentId: string) {
    setAttendanceSaved(false);
    setStatuses((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present",
    }));
  }

  async function handleSave() {
    const payload = {
      class_id: classId,
      date: dateStr,
      records: records.map((r) => ({
        student_id: r.student_id,
        date: dateStr,
        status: statuses[r.student_id] ?? "present",
      })),
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await queueAttendanceSave(payload);
      toast.success(t("saveAttendanceOffline"));
      return;
    }

    startTransition(async () => {
      const result = await saveAttendance(payload);
      if ("error" in result && result.error) {
        toast.error(typeof result.error === "string" ? result.error : t("saveAttendanceFailed"));
        return;
      }
      setAttendanceSaved(true);
      toast.success(t("attendanceSaved"));
      router.refresh();
    });
  }

  async function handleMarkAllPresent() {
    const presentRecords = records.map((r) => ({
      student_id: r.student_id,
      date: dateStr,
      status: "present" as const,
    }));

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await queueAttendanceSave({
        class_id: classId,
        date: dateStr,
        records: presentRecords,
      });
      setStatuses(Object.fromEntries(records.map((r) => [r.student_id, "present" as const])));
      toast.success(t("markAllPresentOffline"));
      return;
    }

    startTransition(async () => {
      const result = await markAllPresent(classId, dateStr);
      if ("error" in result && result.error) {
        toast.error(typeof result.error === "string" ? result.error : t("markAllPresentFailed"));
        return;
      }
      setStatuses(Object.fromEntries(records.map((r) => [r.student_id, "present" as const])));
      setAttendanceSaved(true);
      toast.success(t("allStudentsMarkedPresent"));
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <Label htmlFor="class-select">{t("classLabel")}</Label>
          <select
            id="class-select"
            value={classId}
            onChange={(e) => updateParams("class", e.target.value)}
            className="mt-1 w-full min-w-[180px] rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>{tc("date")}</Label>
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
          {t("saveAttendance")}
        </Button>
        <Button size="sm" variant="outline" onClick={handleMarkAllPresent} disabled={pending || !classId}>
          {t("markAllPresent")}
        </Button>
        {absentStudentIds.length > 0 && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setLessonModalOpen(true)}
            disabled={pending}
          >
            {t("sendTodaysLesson")}
          </Button>
        )}
      </div>

      {absentStudentIds.length > 0 && (
        <p className="text-sm text-stone-600 dark:text-stone-400">
          {t("sendTodaysLessonDesc", { count: absentStudentIds.length })}
        </p>
      )}

      {records.length === 0 ? (
        <p className="text-sm text-stone-500">{t("noStudentsInClass")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border dark:border-stone-700">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800">
              <tr>
                <th className="px-4 py-2 text-left font-medium">{t("studentCol")}</th>
                <th className="px-4 py-2 text-left font-medium">{t("idCol")}</th>
                <th className="px-4 py-2 text-left font-medium">{tc("status")}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const status = statuses[r.student_id] ?? r.status;
                return (
                  <tr key={r.student_id} className="border-t dark:border-stone-700">
                    <td className="px-4 py-2">{r.student_name}</td>
                    <td className="px-4 py-2 text-stone-500">{r.student_number ?? tc("emptyDash")}</td>
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
                        {status === "present" ? t("present") : t("absent")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {sentMaterials.length > 0 && (
        <div className="rounded-lg border p-4 dark:border-stone-700">
          <h2 className="text-sm font-semibold">{t("sentTodayTitle")}</h2>
          <ul className="mt-2 space-y-2">
            {sentMaterials.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div>
                  <span className="font-medium">{item.title}</span>
                  {item.subject_name && (
                    <span className="ml-2 text-stone-500">· {item.subject_name}</span>
                  )}
                </div>
                <span className="text-stone-500">
                  {t("sentTodayRecipients", { count: item.recipient_count })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <LessonMaterialModal
        isOpen={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        classId={classId}
        lessonDate={dateStr}
        schoolId={schoolId}
        teacherId={teacherId}
        subjects={subjects}
        records={records}
        absentStudentIds={absentStudentIds}
        attendanceSaved={attendanceSaved}
      />
    </div>
  );
}
