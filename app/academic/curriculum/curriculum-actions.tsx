"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { deleteCurriculum } from "@/lib/actions/curriculum";
import { toast } from "@/lib/toast";
import type { CurriculumListItem } from "@/lib/db/curriculum";
import { CurriculumForm } from "./curriculum-form";

type SubjectOption = { id: string; name: string };

export function CurriculumActions({
  item,
  branchId,
  subjects,
}: {
  item: CurriculumListItem;
  branchId: string;
  subjects: SubjectOption[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete curriculum for ${item.grade}  -  ${item.subject_name}?`)) return;
    const result = await deleteCurriculum(item.id);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to delete");
      return;
    }
    toast.success("Curriculum entry deleted");
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete}>
          Delete
        </Button>
      </div>

      <Modal
        isOpen={editing}
        onClose={() => setEditing(false)}
        title={`Edit ${item.grade}  -  ${item.subject_name}`}
      >
        <CurriculumForm
          branchId={branchId}
          subjects={subjects}
          editing={item}
          onCancelEdit={() => setEditing(false)}
        />
      </Modal>
    </>
  );
}
