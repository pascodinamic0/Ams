"use client";

import { useState, useTransition } from "react";
import { submitAssignment } from "@/lib/actions/assignments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";

export function StudentAssignmentSubmitForm({
  assignmentId,
  submitLabel,
  placeholder,
  submittingLabel,
}: {
  assignmentId: string;
  submitLabel: string;
  placeholder: string;
  submittingLabel: string;
}) {
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await submitAssignment({
        assignmentId,
        textResponse: text,
      });
      if (result.error) {
        const message =
          typeof result.error === "string"
            ? result.error
            : "Could not submit assignment";
        toast.error(message);
        return;
      }
      toast.success("Assignment submitted");
      setText("");
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3 border-t border-stone-100 pt-4 dark:border-stone-800">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder={placeholder}
        disabled={pending}
        required
      />
      <Button type="submit" size="sm" disabled={pending || !text.trim()}>
        {pending ? submittingLabel : submitLabel}
      </Button>
    </form>
  );
}
