"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  async function handleDelete() {
    const confirmed = confirm(
      `Delete "${schoolName}"? This permanently removes the school and all related data (branches, students, staff, finances, etc.). This cannot be undone.`
    );
    if (!confirmed) return;

    const result = await deleteSchool(schoolId);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("School deleted");
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
      Delete
    </Button>
  );
}
