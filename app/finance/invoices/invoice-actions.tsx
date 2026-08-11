"use client";

import Link from "next/link";
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
    <div className="flex flex-wrap gap-1">
      {!locked ? (
        <Link
          href={`/finance/invoices?edit=${id}`}
          className="inline-flex h-8 items-center rounded-md px-3 text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          {t("editInvoice")}
        </Link>
      ) : null}
      <DeleteInvoiceButton id={id} />
    </div>
  );
}
