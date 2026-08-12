"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { deleteExpense } from "@/lib/actions/expenses";
import { toast } from "@/lib/toast";

export function DeleteExpenseButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations("finance");
  const tc = useTranslations("common");

  async function handleDelete() {
    if (!confirm(t("confirmDeleteExpense"))) return;
    const result = await deleteExpense(id);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : t("expenseDeleteFailed"));
      return;
    }
    toast.success(t("expenseDeleted"));
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete}>
      {tc("delete")}
    </Button>
  );
}
