"use client";

import Link from "next/link";
import { DeleteExpenseButton } from "./delete-button";

export function ExpenseActions({ id }: { id: string }) {
  return (
    <div className="flex gap-1">
      <Link
        href={`/finance/expenses?edit=${id}`}
        className="inline-flex h-8 items-center rounded-md px-3 text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
      >
        Edit
      </Link>
      <DeleteExpenseButton id={id} />
    </div>
  );
}
