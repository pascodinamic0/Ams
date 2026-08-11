"use client";

import Link from "next/link";
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
  return (
    <div className="flex flex-wrap gap-1">
      {status === "approved" && receiptNumber ? (
        <Link
          href={`/finance/expenses/${id}/receipt`}
          className="inline-flex h-8 items-center rounded-md px-3 text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          Receipt
        </Link>
      ) : null}
      {status !== "approved" ? (
        <>
          <Link
            href={`/finance/expenses?edit=${id}`}
            className="inline-flex h-8 items-center rounded-md px-3 text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Edit
          </Link>
          <DeleteExpenseButton id={id} />
        </>
      ) : null}
    </div>
  );
}
