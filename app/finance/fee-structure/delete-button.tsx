"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { deleteFeeStructure } from "@/lib/actions/fee-structures";
import { toast } from "@/lib/toast";

export function DeleteFeeStructureButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations("finance");
  const tc = useTranslations("common");

  async function handleDelete() {
    if (!confirm(t("confirmDeleteFeeStructure"))) return;
    const result = await deleteFeeStructure(id);
    if ("error" in result && result.error) {
      toast.error(typeof result.error === "string" ? result.error : t("feeStructureDeleteFailed"));
      return;
    }
    toast.success(t("feeStructureDeleted"));
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete}>
      {tc("delete")}
    </Button>
  );
}
