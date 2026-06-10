"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCurriculum, updateCurriculum } from "@/lib/actions/curriculum";
import { toast } from "@/lib/toast";
import type { CurriculumListItem } from "@/lib/db/curriculum";

type SubjectOption = { id: string; name: string };

interface Props {
  branchId: string;
  subjects: SubjectOption[];
  editing?: CurriculumListItem | null;
  onCancelEdit?: () => void;
}

export function CurriculumForm({ branchId, subjects, editing, onCancelEdit }: Props) {
  const router = useRouter();
  const [grade, setGrade] = useState(editing?.grade ?? "");
  const [subjectId, setSubjectId] = useState(editing?.subject_id ?? "");
  const [syllabus, setSyllabus] = useState(editing?.syllabus ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      branch_id: branchId,
      grade,
      subject_id: subjectId,
      syllabus: syllabus || undefined,
    };

    const result = editing
      ? await updateCurriculum(editing.id, payload)
      : await createCurriculum(payload);

    setLoading(false);

    if (result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : "Failed to save curriculum entry"
      );
      return;
    }

    toast.success(editing ? "Curriculum updated" : "Curriculum entry created");
    if (!editing) {
      setGrade("");
      setSubjectId("");
      setSyllabus("");
    }
    onCancelEdit?.();
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div>
        <Label htmlFor="curriculum-grade">Grade</Label>
        <Input
          id="curriculum-grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="e.g. Grade 5"
          required
        />
      </div>
      <div>
        <Label htmlFor="curriculum-subject">Subject</Label>
        <select
          id="curriculum-subject"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2 lg:col-span-1">
        <Label htmlFor="curriculum-syllabus">Syllabus</Label>
        <Input
          id="curriculum-syllabus"
          value={syllabus}
          onChange={(e) => setSyllabus(e.target.value)}
          placeholder="Optional syllabus notes"
        />
      </div>
      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
        <Button type="submit" disabled={loading || subjects.length === 0} className="flex-1">
          {editing ? "Update entry" : "Add entry"}
        </Button>
        {editing && onCancelEdit && (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
