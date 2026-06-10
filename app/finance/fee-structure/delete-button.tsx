"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteFeeStructure } from "@/lib/actions/fee-structures";
import { toast } from "@/lib/toast";

export function DeleteFeeStructureButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this fee structure?")) return;
    const result = await deleteFeeStructure(id);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to delete");
      return;
    }
    toast.success("Fee structure deleted");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete}>
      Delete
    </Button>
  );
}
