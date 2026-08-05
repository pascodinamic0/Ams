"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteStudents } from "@/lib/actions/students";
import { toast } from "@/lib/toast";

export type StudentsTableRow = {
  id: string;
  student_id: string | null;
  name: string;
  class_name: string | null;
  guardian_name: string | null;
  status: string;
};

const PAGE_SIZE = 10;

export function StudentsTable({ students }: { students: StudentsTableRow[] }) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const pageRows = useMemo(
    () => students.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [students, page]
  );

  const allVisibleSelected =
    pageRows.length > 0 && pageRows.every((row) => selectedIds.has(row.id));

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const row of pageRows) next.delete(row.id);
      } else {
        for (const row of pageRows) next.add(row.id);
      }
      return next;
    });
  }, [allVisibleSelected, pageRows]);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(students.map((s) => s.id)));
  }, [students]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(t("deleteStudentsConfirm", { count: selectedIds.size }))) {
      return;
    }

    setDeleting(true);
    const result = await deleteStudents(Array.from(selectedIds));
    setDeleting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(t("studentsDeleted", { count: result.data?.deletedCount ?? selectedIds.size }));
    setSelectedIds(new Set());
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-raised px-4 py-3">
        <span className="text-sm text-muted">
          {t("studentsSelected", { count: selectedIds.size })}
        </span>
        <button
          type="button"
          onClick={selectAll}
          className="text-sm text-primary hover:underline"
          disabled={students.length === 0}
        >
          {tc("selectAll")} ({students.length})
        </button>
        <button
          type="button"
          onClick={clearSelection}
          className="text-sm text-muted hover:underline"
          disabled={selectedIds.size === 0}
        >
          {tc("clearSelection")}
        </button>
        <div className="ml-auto">
          <Button
            variant="ghost"
            className="text-red-600"
            disabled={selectedIds.size === 0 || deleting}
            onClick={handleBulkDelete}
          >
            {deleting
              ? tc("deleting")
              : t("deleteSelectedStudents", { count: selectedIds.size })}
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-raised">
              <th className="w-12 px-4 py-4">
                <Checkbox
                  aria-label={tc("selectAll")}
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                />
              </th>
              <th className="px-6 py-4 font-medium text-muted">{t("studentId")}</th>
              <th className="px-6 py-4 font-medium text-muted">{tc("name")}</th>
              <th className="px-6 py-4 font-medium text-muted">{t("class")}</th>
              <th className="px-6 py-4 font-medium text-muted">{t("guardian")}</th>
              <th className="px-6 py-4 font-medium text-muted">{tc("status")}</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="px-4 py-4">
                  <Checkbox
                    aria-label={row.name}
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                  />
                </td>
                <td className="px-6 py-4 text-foreground">{row.student_id ?? "—"}</td>
                <td className="px-6 py-4 text-foreground">
                  <Link
                    href={`/academic/students/${row.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {row.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-foreground">{row.class_name ?? "—"}</td>
                <td className="px-6 py-4 text-foreground">{row.guardian_name ?? "—"}</td>
                <td className="px-6 py-4 text-foreground">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <span className="text-sm text-muted">
            {tc("pageOf", { current: page + 1, total: totalPages })}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded border border-border px-3 py-1 text-sm disabled:opacity-50"
            >
              {tc("previous")}
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded border border-border px-3 py-1 text-sm disabled:opacity-50"
            >
              {tc("next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
