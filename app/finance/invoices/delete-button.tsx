"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { deleteInvoice } from "@/lib/actions/invoices";
import { toast } from "@/lib/toast";

export function DeleteInvoiceButton({ id }: { id: string }) {
  const router = useRouter();
  const t = useTranslations("finance");

  async function handleDelete() {
    if (!confirm(t("deleteInvoiceConfirm"))) return;
    const result = await deleteInvoice(id);
    if (result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : t("invoiceDeleteFailed")
      );
      return;
    }
    toast.success(t("invoiceDeleted"));
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete}>
      {t("deleteInvoice")}
    </Button>
  );
}
