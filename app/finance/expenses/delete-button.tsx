"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteExpense } from "@/lib/actions/expenses";
import { toast } from "@/lib/toast";

export function DeleteExpenseButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this expense?")) return;
    const result = await deleteExpense(id);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to delete");
      return;
    }
    toast.success("Expense deleted");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete}>
      Delete
    </Button>
  );
}
