"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { deleteStudent } from "@/lib/actions/students";
import { toast } from "@/lib/toast";

export function DeleteStudentButton({ id }: { id: string }) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(t("deleteStudentConfirm"))) return;
    const result = await deleteStudent(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("studentDeleted"));
    router.push("/academic/students");
    router.refresh();
  }

  return (
    <Button variant="ghost" className="text-red-600" onClick={handleDelete}>
      {tc("delete")}
    </Button>
  );
}
