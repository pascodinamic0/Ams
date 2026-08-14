"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { deleteSchool } from "@/lib/actions/schools";
import { toast } from "@/lib/toast";

export function DeleteSchoolButton({
  schoolId,
  schoolName,
  redirectToList = false,
}: {
  schoolId: string;
  schoolName: string;
  redirectToList?: boolean;
}) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const router = useRouter();

  async function handleDelete() {
    const confirmed = confirm(t("deleteSchoolConfirm", { name: schoolName }));
    if (!confirmed) return;

    const result = await deleteSchool(schoolId);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(t("schoolDeleted"));
    if (redirectToList) {
      router.push("/admin/schools");
    }
    router.refresh();
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-red-600 hover:text-red-700"
      onClick={handleDelete}
    >
      {tc("delete")}
    </Button>
  );
}
