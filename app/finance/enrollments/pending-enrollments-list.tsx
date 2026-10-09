"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state";
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
  const onSearch = useCallback((value: string) => {
    setSearch(value.trim().toLowerCase());
  }, []);

  const filtered = useMemo(() => {
    if (!search) return rows;
    return rows.filter((row) =>
      [row.student_name, row.student_number, row.class_name, row.enrollment_receipt_ref]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search))
    );
  }, [rows, search]);

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
      <div className="w-full sm:w-72">
        <SearchInput
          placeholder={t("searchStudentsPlaceholder")}
          onSearch={onSearch}
        />
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
