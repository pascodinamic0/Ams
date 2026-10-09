"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { SearchInput } from "@/components/ui/search-input";
import type { PendingEnrollmentRow } from "@/lib/db/pending-enrollments";
import { ConfirmEnrollmentForm } from "./confirm-enrollment-form";

export function PendingEnrollmentsList({
  rows,
  schoolId,
  currencyCode,
}: {
  rows: PendingEnrollmentRow[];
  schoolId?: string;
  currencyCode: string;
}) {
  const t = useTranslations("finance");
  const [search, setSearch] = useState("");
  const [className, setClassName] = useState("");
  const onSearch = useCallback((value: string) => {
    setSearch(value.trim().toLowerCase());
  }, []);

  const classOptions = useMemo(() => {
    const names = new Set<string>();
    for (const row of rows) {
      if (row.class_name) names.add(row.class_name);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (className && row.class_name !== className) return false;
      if (!search) return true;
      return [row.student_name, row.student_number, row.class_name, row.enrollment_receipt_ref]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search));
    });
  }, [rows, search, className]);

  if (rows.length === 0) {
    return (
      <EmptyState
        title={t("noPendingEnrollments")}
        description={t("noPendingEnrollmentsDesc")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-full sm:w-72">
          <Label htmlFor="pending-enrollment-search">{t("searchStudentsPlaceholder")}</Label>
          <div className="mt-1">
            <SearchInput
              id="pending-enrollment-search"
              placeholder={t("searchStudentsPlaceholder")}
              onSearch={onSearch}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="pending-enrollment-class">{t("colClass")}</Label>
          <select
            id="pending-enrollment-class"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="mt-1 h-10 w-full min-w-[160px] rounded-lg border bg-surface px-3 text-sm dark:border-stone-700 dark:bg-stone-900"
          >
            <option value="">{t("allClasses")}</option>
            {classOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title={t("noStudentsMatchSearch")} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((row) => (
            <ConfirmEnrollmentForm
              key={`${row.student_id}-${row.invoice_balance}`}
              row={row}
              schoolId={schoolId}
              currencyCode={currencyCode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
