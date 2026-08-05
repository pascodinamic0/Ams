"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { gradeSubmission } from "@/lib/actions/assignments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";

export function GradeSubmissionForm({
  submissionId,
  initialGrade,
  gradeLabel,
  saveLabel,
}: {
  submissionId: string;
  initialGrade: number | null;
  gradeLabel: string;
  saveLabel: string;
}) {
  const router = useRouter();
  const [grade, setGrade] = useState(initialGrade?.toString() ?? "");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(grade);
    if (Number.isNaN(value) || value < 0 || value > 100) {
      toast.error("Enter a grade between 0 and 100");
      return;
    }

    startTransition(async () => {
      const result = await gradeSubmission({
        submissionId,
        grade: value,
      });
      if (result.error) {
        const message =
          typeof result.error === "string"
            ? result.error
            : "Could not save grade";
        toast.error(message);
        return;
      }
      toast.success("Grade saved");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <label className="sr-only" htmlFor={`grade-${submissionId}`}>
        {gradeLabel}
      </label>
      <Input
        id={`grade-${submissionId}`}
        type="number"
        min={0}
        max={100}
        step={0.5}
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        className="h-9 w-24"
        disabled={pending}
        required
      />
      <Button type="submit" size="sm" disabled={pending || !grade.trim()}>
        {saveLabel}
      </Button>
    </form>
  );
}
