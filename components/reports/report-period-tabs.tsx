"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  basePath: string;
  monthlyLabel: string;
  dailyLabel: string;
  dailyEnabled: boolean;
  monthQuery?: string;
  dateQuery?: string;
};

export function ReportPeriodTabs({
  basePath,
  monthlyLabel,
  dailyLabel,
  dailyEnabled,
  monthQuery,
  dateQuery,
}: Props) {
  const pathname = usePathname();
  const isMonthly = pathname.includes(`${basePath}/monthly`);
  const monthlyHref = monthQuery
    ? `${basePath}/monthly?month=${monthQuery}`
    : `${basePath}/monthly`;
  const dailyHref = dateQuery
    ? `${basePath}/daily?date=${dateQuery}`
    : `${basePath}/daily`;

  return (
    <div className="inline-flex rounded-lg border border-stone-200 p-1 dark:border-stone-700">
      <Link
        href={monthlyHref}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          isMonthly
            ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
            : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
        }`}
      >
        {monthlyLabel}
      </Link>
      {dailyEnabled ? (
        <Link
          href={dailyHref}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            !isMonthly
              ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
              : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
          }`}
        >
          {dailyLabel}
        </Link>
      ) : null}
    </div>
  );
}
