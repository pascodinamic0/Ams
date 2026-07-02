"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { deleteAssignment } from "@/lib/actions/assignments";
import { toast } from "@/lib/toast";

export function DeleteAssignmentButton({ id }: { id: string }) {
  const t = useTranslations("teacher");
  const tc = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(t("deleteAssignmentConfirm"))) return;
    startTransition(async () => {
      const result = await deleteAssignment(id);
      if (result.error) {
        toast.error(typeof result.error === "string" ? result.error : t("deleteFailed"));
        return;
      }
      toast.success(t("assignmentDeleted"));
      router.refresh();
    });
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={pending}>
      {tc("delete")}
    </Button>
  );
}
