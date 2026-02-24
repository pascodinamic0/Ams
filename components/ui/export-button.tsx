"use client";

import { Button } from "./button";
import { exportToCSV } from "@/lib/export-csv";

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  columns: { key: keyof T; label: string }[];
  filename: string;
  label?: string;
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  columns,
  filename,
  label = "Export CSV",
}: ExportButtonProps<T>) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => exportToCSV(data, columns, filename)}
    >
      {label}
    </Button>
  );
}
