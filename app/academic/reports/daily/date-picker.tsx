"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  date: string;
  label: string;
};

export function DatePicker({ date, label }: Props) {
  const router = useRouter();

  function shiftDays(delta: number) {
    const current = new Date(`${date}T12:00:00`);
    current.setDate(current.getDate() + delta);
    const next = current.toISOString().slice(0, 10);
    router.push(`/academic/reports/daily?date=${next}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-stone-500">{label}</span>
      <Button type="button" variant="outline" size="sm" onClick={() => shiftDays(-1)}>
        ?
      </Button>
      <input
        type="date"
        value={date}
        onChange={(e) => {
          if (e.target.value) {
            router.push(`/academic/reports/daily?date=${e.target.value}`);
          }
        }}
        className="rounded-md border border-stone-200 px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900"
      />
      <Button type="button" variant="outline" size="sm" onClick={() => shiftDays(1)}>
        ?
      </Button>
    </div>
  );
}
