"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteAssignment } from "@/lib/actions/assignments";
import { toast } from "@/lib/toast";

export function DeleteAssignmentButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this assignment?")) return;
    startTransition(async () => {
      const result = await deleteAssignment(id);
      if (result.error) {
        toast.error(typeof result.error === "string" ? result.error : "Failed to delete");
        return;
      }
      toast.success("Assignment deleted");
      router.refresh();
    });
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={pending}>
      Delete
    </Button>
  );
}
