"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { DeleteInvoiceButton } from "./delete-button";

export function InvoiceActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const t = useTranslations("finance");
  const locked = status === "paid";

  return (
    <div className="flex items-center gap-1">
      {!locked ? (
        <Link
          href={`/finance/invoices?edit=${id}`}
          title={t("editInvoice")}
          aria-label={t("editInvoice")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      ) : null}
      <DeleteInvoiceButton id={id} compact />
    </div>
  );
}
