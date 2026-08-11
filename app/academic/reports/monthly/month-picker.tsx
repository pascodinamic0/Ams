"use client";

import { useRouter } from "next/navigation";

type Props = {
  year: number;
  month: number;
  label: string;
};

export function MonthPicker({ year, month, label }: Props) {
  const router = useRouter();
  const value = `${year}-${String(month).padStart(2, "0")}`;

  return (
    <label className="flex items-center gap-2 text-sm print:hidden">
      <span className="text-stone-500">{label}</span>
      <input
        type="month"
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          if (!next) return;
          router.push(`/academic/reports/monthly?month=${next}`);
        }}
        className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900"
      />
    </label>
  );
}
