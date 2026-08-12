"use client";

import Link from "next/link";
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
          href={`/finance/expenses/${id}/receipt`}
          className="inline-flex h-8 items-center rounded-md px-3 text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          {t("colReceipt")}
        </Link>
      ) : null}
      {status !== "approved" ? (
        <>
          <Link
            href={`/finance/expenses?edit=${id}`}
            className="inline-flex h-8 items-center rounded-md px-3 text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {tc("edit")}
          </Link>
          <DeleteExpenseButton id={id} />
        </>
      ) : null}
    </div>
  );
}
