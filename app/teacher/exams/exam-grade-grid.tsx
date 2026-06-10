"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { upsertGrades } from "@/lib/actions/grades";
import { toast } from "@/lib/toast";
import type { GradeGridItem } from "@/lib/db";

interface Props {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  initialClassId: string;
  initialSubjectId: string;
  initialExamName: string;
  rows: GradeGridItem[];
}

export function ExamGradeGrid({
  classes,
  subjects,
  initialClassId,
  initialSubjectId,
  initialExamName,
  rows,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [marks, setMarks] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      rows.map((r) => [r.student_id, r.marks !== null ? String(r.marks) : ""])
    )
  );
  const [letterGrades, setLetterGrades] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.student_id, r.grade ?? ""]))
  );

  const classId = searchParams.get("class") ?? initialClassId;
  const subjectId = searchParams.get("subject") ?? initialSubjectId;
  const examName = searchParams.get("exam") ?? initialExamName;

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`/teacher/exams?${params.toString()}`);
  }

  async function handleSave() {
    if (!classId || !subjectId || !examName) {
      toast.error("Select class, subject, and exam name");
      return;
    }

    startTransition(async () => {
      const grades = rows.map((r) => ({
        student_id: r.student_id,
        subject_id: subjectId,
        class_id: classId,
        term: examName,
        marks: marks[r.student_id] ? Number(marks[r.student_id]) : null,
        grade: letterGrades[r.student_id] || null,
      }));

      const result = await upsertGrades({ grades });
      if (result.error) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to save exam grades");
        return;
      }
      toast.success("Exam grades saved");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <Label htmlFor="exam-class">Class</Label>
          <select
            id="exam-class"
            value={classId}
            onChange={(e) => updateParams({ class: e.target.value })}
            className="mt-1 w-full min-w-[160px] rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="exam-subject">Subject</Label>
          <select
            id="exam-subject"
            value={subjectId}
            onChange={(e) => updateParams({ subject: e.target.value })}
            className="mt-1 w-full min-w-[160px] rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="exam-name">Exam name</Label>
          <Input
            id="exam-name"
            defaultValue={examName}
            placeholder="e.g. Midterm Exam"
            onBlur={(e) => updateParams({ exam: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParams({ exam: e.currentTarget.value });
            }}
          />
        </div>
      </div>

      <Button size="sm" onClick={handleSave} disabled={pending || !subjectId || !examName}>
        Save exam grades
      </Button>

      {!subjectId || !examName ? (
        <p className="text-sm text-slate-500">Select a subject and exam name to enter marks.</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500">No students in this class.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Student</th>
                <th className="px-4 py-2 text-left font-medium">Marks</th>
                <th className="px-4 py-2 text-left font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.student_id} className="border-t dark:border-slate-700">
                  <td className="px-4 py-2">{r.student_name}</td>
                  <td className="px-4 py-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className="w-24"
                      value={marks[r.student_id] ?? ""}
                      onChange={(e) =>
                        setMarks((prev) => ({ ...prev, [r.student_id]: e.target.value }))
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      className="w-20"
                      placeholder="A"
                      value={letterGrades[r.student_id] ?? ""}
                      onChange={(e) =>
                        setLetterGrades((prev) => ({ ...prev, [r.student_id]: e.target.value }))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
