"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { deleteStudent } from "@/lib/actions/students";
import { toast } from "@/lib/toast";

export function DeleteStudentButton({
  id,
  name,
  compact = false,
}: {
  id: string;
  name: string;
  compact?: boolean;
}) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(t("deleteStudentConfirm", { name }))) return;
    const result = await deleteStudent(id);
    if ("error" in result && result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : t("deleteFailed")
      );
      return;
    }
    toast.success(t("studentDeleted"));
    if (!compact) {
      router.push("/academic/students");
    }
    router.refresh();
  }

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600"
        onClick={handleDelete}
        aria-label={t("deleteStudent")}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete}>
      {tc("delete")}
    </Button>
  );
}
