"use client";

import { isValidElement, useState, type ReactNode } from "react";
import { TableSkeleton } from "./table-skeleton";

export interface ColumnDef<T> {
  id: string;
  header: string;
  /** Serializable field name — define columns in a Client Component when using React nodes. */
  accessorKey: keyof T & string;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  /** Row field used as React key. Defaults to "id". */
  keyField?: keyof T & string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

function getCellValue<T>(row: T, accessor: keyof T): ReactNode {
  const value = row[accessor];
  if (value === null || value === undefined) return "—";
  if (isValidElement(value)) return value;
  return String(value);
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading = false,
  keyField = "id" as keyof T & string,
  onRowClick,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const totalPages = Math.ceil(data.length / pageSize);

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const col = columns.find((c) => c.id === sortKey);
    if (!col) return 0;
    const aVal = (a as Record<string, unknown>)[col.accessorKey as string];
    const bVal = (b as Record<string, unknown>)[col.accessorKey as string];
    if (aVal === bVal) return 0;
    const cmp = String(aVal) < String(bVal) ? -1 : 1;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const paginatedData = sortedData.slice(page * pageSize, page * pageSize + pageSize);

  const handleSort = (id: string) => {
    const col = columns.find((c) => c.id === id);
    if (!col?.sortable) return;
    setSortKey((k) => (k === id ? id : id));
    setSortDir((d) => (sortKey === id && d === "asc" ? "desc" : "asc"));
  };

  if (isLoading) {
    return <TableSkeleton rows={pageSize} columns={columns.length} />;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            {columns.map((col) => (
              <th
                key={col.id}
                className={`px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300 ${
                  col.sortable ? "cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-zinc-800" : ""
                } ${col.className ?? ""}`}
                onClick={() => col.sortable && handleSort(col.id)}
              >
                <span className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.id && (
                    <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-zinc-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            paginatedData.map((row, index) => {
              const rawKey = row[keyField];
              const rowKey =
                rawKey != null && rawKey !== ""
                  ? String(rawKey)
                  : `row-${page * pageSize + index}`;

              return (
              <tr
                key={rowKey}
                className={`border-b border-zinc-200 last:border-0 dark:border-zinc-800 ${
                  onRowClick
                    ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    : ""
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`px-6 py-4 text-zinc-900 dark:text-zinc-100 ${col.className ?? ""}`}
                  >
                    {getCellValue(row, col.accessorKey)}
                  </td>
                ))}
              </tr>
              );
            })
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 px-4 py-2 dark:border-zinc-800">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-zinc-700"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-zinc-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
