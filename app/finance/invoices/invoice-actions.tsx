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
          className="inline-flex min-h-8 max-w-full items-center overflow-hidden whitespace-nowrap rounded-md px-3 text-xs hover:bg-stone-100 sm:text-sm dark:hover:bg-stone-800"
        >
          {t("editInvoice")}
        </Link>
      ) : null}
      <DeleteInvoiceButton id={id} />
    </div>
  );
}
