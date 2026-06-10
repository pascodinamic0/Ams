"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
  classes: { id: string; name: string }[];
  initialClassId: string;
  initialTerm: string;
}

export function ReportCardFilters({ classes, initialClassId, initialTerm }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get("class") ?? initialClassId;
  const term = searchParams.get("term") ?? initialTerm;

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`/teacher/report-cards?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4 print:hidden">
      <div>
        <Label htmlFor="rc-class">Class</Label>
        <select
          id="rc-class"
          value={classId}
          onChange={(e) => updateParams({ class: e.target.value })}
          className="mt-1 w-full min-w-[160px] rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="rc-term">Term</Label>
        <Input
          id="rc-term"
          defaultValue={term}
          placeholder="Term 1"
          onBlur={(e) => updateParams({ term: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateParams({ term: e.currentTarget.value });
          }}
        />
      </div>
      <Button type="button" size="sm" onClick={() => window.print()}>
        Print report cards
      </Button>
    </div>
  );
}
