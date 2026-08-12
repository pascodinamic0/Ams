"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { DeleteExpenseButton } from "./delete-button";

export function ExpenseActions({
  id,
  status,
  receiptNumber,
}: {
  id: string;
  status: "pending" | "approved" | "rejected";
  receiptNumber?: string | null;
}) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");

  return (
    <div className="flex flex-wrap gap-1">
      {status === "approved" && receiptNumber ? (
        <Link
          href={`/finance/expenses/${id}/receipt?download=1`}
          className="inline-flex min-h-8 max-w-full items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-md px-3 text-xs hover:bg-stone-100 sm:text-sm dark:hover:bg-stone-800"
        >
          <Download className="h-3.5 w-3.5" />
          {t("downloadReceipt")}
        </Link>
      ) : null}
      {status !== "approved" ? (
        <>
          <Link
            href={`/finance/expenses?edit=${id}`}
            className="inline-flex min-h-8 max-w-full items-center overflow-hidden whitespace-nowrap rounded-md px-3 text-xs hover:bg-stone-100 sm:text-sm dark:hover:bg-stone-800"
          >
            {tc("edit")}
          </Link>
          <DeleteExpenseButton id={id} />
        </>
      ) : null}
    </div>
  );
}
