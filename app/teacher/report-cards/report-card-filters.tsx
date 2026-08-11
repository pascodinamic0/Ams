"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SchoolYearSelect } from "@/components/academic/school-year-select";
import { getCurrentSchoolYearStart } from "@/lib/academic/school-year";

interface Props {
  classes: { id: string; name: string }[];
  initialClassId: string;
  initialTerm: string;
  initialSchoolYear: number;
}

export function ReportCardFilters({
  classes,
  initialClassId,
  initialTerm,
  initialSchoolYear,
}: Props) {
  const t = useTranslations("teacher");
  const tc = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get("class") ?? initialClassId;
  const term = searchParams.get("term") ?? initialTerm;
  const parsedYear = Number(searchParams.get("year"));
  const schoolYear = Number.isFinite(parsedYear)
    ? parsedYear
    : initialSchoolYear || getCurrentSchoolYearStart();

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
        <Label htmlFor="rc-class">{t("classLabel")}</Label>
        <select
          id="rc-class"
          value={classId}
          onChange={(e) => updateParams({ class: e.target.value })}
          className="mt-1 w-full min-w-[160px] rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <SchoolYearSelect
        id="rc-year"
        className="min-w-[160px]"
        label={tc("schoolYear")}
        value={schoolYear}
        onChange={(e) => updateParams({ year: e.target.value })}
      />
      <div>
        <Label htmlFor="rc-term">{t("termLabel")}</Label>
        <Input
          id="rc-term"
          defaultValue={term}
          placeholder={t("termPlaceholderShort")}
          onBlur={(e) => updateParams({ term: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateParams({ term: e.currentTarget.value });
          }}
        />
      </div>
      <Button type="button" size="sm" onClick={() => window.print()}>
        {t("printReportCards")}
      </Button>
    </div>
  );
}
