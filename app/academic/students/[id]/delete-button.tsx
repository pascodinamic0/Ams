"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteStudent } from "@/lib/actions/students";
import { toast } from "@/lib/toast";

export function DeleteStudentButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this student?")) return;
    const result = await deleteStudent(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Student deleted");
    router.push("/academic/students");
    router.refresh();
  }

  return (
    <Button variant="ghost" className="text-red-600" onClick={handleDelete}>
      Delete
    </Button>
  );
}
