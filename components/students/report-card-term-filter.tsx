"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
  basePath: string;
  initialTerm: string;
  termLabel: string;
  termPlaceholder: string;
  availableTerms?: string[];
};

export function ReportCardTermFilter({
  basePath,
  initialTerm,
  termLabel,
  termPlaceholder,
  availableTerms = [],
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const term = searchParams.get("term") ?? initialTerm;

  function updateTerm(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("term", value);
    else params.delete("term");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4 print:hidden">
      <div>
        <Label htmlFor="student-rc-term">{termLabel}</Label>
        {availableTerms.length > 0 ? (
          <select
            id="student-rc-term"
            value={availableTerms.includes(term) ? term : availableTerms[0]}
            onChange={(e) => updateTerm(e.target.value)}
            className="mt-1 w-full min-w-[160px] rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
          >
            {availableTerms.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        ) : (
          <Input
            id="student-rc-term"
            className="mt-1 min-w-[160px]"
            defaultValue={term}
            placeholder={termPlaceholder}
            onBlur={(e) => updateTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateTerm(e.currentTarget.value);
            }}
          />
        )}
      </div>
    </div>
  );
}
