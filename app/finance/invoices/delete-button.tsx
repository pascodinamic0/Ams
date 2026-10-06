"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteInvoice } from "@/lib/actions/invoices";
import { toast } from "@/lib/toast";

export function DeleteInvoiceButton({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("finance");

  async function handleDelete() {
    if (!confirm(t("deleteInvoiceConfirm"))) return;
    const result = await deleteInvoice(id);
    if ("error" in result && result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : t("invoiceDeleteFailed")
      );
      return;
    }
    toast.success(t("invoiceDeleted"));
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={compact ? "h-8 w-8 px-0 text-red-600" : "text-red-600"}
      aria-label={t("deleteInvoice")}
      title={t("deleteInvoice")}
      onClick={handleDelete}
    >
      {compact ? <Trash2 className="h-4 w-4" /> : t("deleteInvoice")}
    </Button>
  );
}
