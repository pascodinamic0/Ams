"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteClass } from "@/lib/actions/classes";
import { toast } from "@/lib/toast";

export function DeleteClassButton({ id, name }: { id: string; name: string }) {
  const tc = useTranslations("common");
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete class "${name}"?`)) return;

    const result = await deleteClass(id);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to delete class");
      return;
    }

    toast.success("Class deleted");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete} aria-label={tc("delete")}>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
