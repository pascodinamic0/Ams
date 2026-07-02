"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  async function handleDelete() {
    if (!confirm(t("deleteCurriculumConfirm", { grade: item.grade, subject: item.subject_name }))) return;
    const result = await deleteCurriculum(item.id);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : t("deleteFailed"));
      return;
    }
    toast.success(t("curriculumDeleted"));
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          {tc("edit")}
        </Button>
        <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete}>
          {tc("delete")}
        </Button>
      </div>

      <Modal
        isOpen={editing}
        onClose={() => setEditing(false)}
        title={t("editCurriculumTitle", { grade: item.grade, subject: item.subject_name })}
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
