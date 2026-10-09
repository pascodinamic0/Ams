"use client";

import { useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { STUDENT_TAGS } from "@/lib/students/tags";
import { formatStudentStatusLabel } from "@/lib/students/status";
import { STUDENT_STATUSES } from "@/lib/validations/student";

export function StudentListFilters({
  initialStatus = "",
  initialTag = "",
  initialQuery = "",
}: {
  initialStatus?: string;
  initialTag?: string;
  initialQuery?: string;
}) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? initialStatus;
  const tag = searchParams.get("tag") ?? initialTag;
  const seededQuery = useRef(initialQuery);

  const updateParams = useCallback(
    (updates: Record<string, string>, mode: "push" | "replace" = "push") => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      const qs = params.toString();
      const href = qs ? `/academic/students?${qs}` : "/academic/students";
      if (mode === "replace") router.replace(href, { scroll: false });
      else router.push(href);
    },
    [router, searchParams]
  );

  const onSearch = useCallback(
    (value: string) => {
      const next = value.trim().slice(0, 80);
      const current = (searchParams.get("q") ?? "").trim();
      if (next === current) return;
      updateParams({ q: next }, "replace");
    },
    [searchParams, updateParams]
  );

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="w-full sm:w-80">
        <Label htmlFor="student-search">{tc("search")}</Label>
        <div className="mt-1">
          <SearchInput
            id="student-search"
            placeholder={t("searchStudentsPlaceholder")}
            value={seededQuery.current}
            onSearch={onSearch}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="student-status-filter">{tc("status")}</Label>
        <Select
          id="student-status-filter"
          className="mt-1 min-w-[160px]"
          value={status}
          onChange={(e) => updateParams({ status: e.target.value })}
          placeholder={tc("all")}
          options={STUDENT_STATUSES.map((value) => ({
            value,
            label: formatStudentStatusLabel(value, {
              active: tc("active"),
              pending: tc("pending"),
              inactive: tc("inactive"),
              graduated: t("statusGraduated"),
            }),
          }))}
        />
      </div>
      <div>
        <Label htmlFor="student-tag-filter">{t("enrollmentTags")}</Label>
        <Select
          id="student-tag-filter"
          className="mt-1 min-w-[180px]"
          value={tag}
          onChange={(e) => updateParams({ tag: e.target.value })}
          placeholder={tc("all")}
          options={STUDENT_TAGS.map((value) => ({
            value,
            label:
              value === "follow_up"
                ? t("tagFollowUp")
                : value === "incomplete_docs"
                  ? t("tagIncompleteDocs")
                  : t("tagFeeHold"),
          }))}
        />
      </div>
    </div>
  );
}
