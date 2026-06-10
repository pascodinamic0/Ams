"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { importStudentsBatch } from "@/lib/actions/students-import";
import type { StudentImportRow } from "@/lib/validations/academic";
import { toast } from "@/lib/toast";

type ClassOption = { id: string; name: string };

interface Props {
  schoolId: string;
  branchId: string;
  classes: ClassOption[];
}

const EXPECTED_HEADERS = ["first_name", "last_name", "date_of_birth", "class", "status"] as const;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field.trim());
      field = "";
      continue;
    }

    if (char === "\n" || (char === "\r" && next === "\n")) {
      row.push(field.trim());
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      field = "";
      if (char === "\r") i++;
      continue;
    }

    if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    if (row.some((cell) => cell.length > 0)) rows.push(row);
  }

  return rows;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function resolveClassId(
  value: string,
  classes: ClassOption[]
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const byId = classes.find((c) => c.id === trimmed);
  if (byId) return byId.id;

  const lower = trimmed.toLowerCase();
  const byName = classes.find((c) => c.name.toLowerCase() === lower);
  return byName?.id;
}

export function StudentImportForm({ schoolId, branchId, classes }: Props) {
  const router = useRouter();
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<StudentImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: number;
    failed: number;
    errors: { row: number; message: string }[];
  } | null>(null);

  const classNames = useMemo(() => classes.map((c) => c.name).join(", "), [classes]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setImportResult(null);
    setPreview([]);
    setParseErrors([]);

    if (!file) {
      setFileName(null);
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const rows = parseCsv(text);

      if (rows.length < 2) {
        setParseErrors(["CSV must include a header row and at least one data row."]);
        return;
      }

      const headers = rows[0].map(normalizeHeader);
      const missing = EXPECTED_HEADERS.filter((h) => !headers.includes(h));
      if (missing.length > 0) {
        setParseErrors([`Missing required columns: ${missing.join(", ")}`]);
        return;
      }

      const index = Object.fromEntries(headers.map((h, i) => [h, i]));
      const parsed: StudentImportRow[] = [];
      const errors: string[] = [];

      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i];
        const rowNumber = i + 1;
        const firstName = cells[index.first_name] ?? "";
        const lastName = cells[index.last_name] ?? "";
        const dob = cells[index.date_of_birth] ?? "";
        const classValue = cells[index.class] ?? "";
        const statusRaw = (cells[index.status] ?? "active").toLowerCase();

        if (!firstName && !lastName && !dob) continue;

        if (!firstName || !lastName || !dob) {
          errors.push(`Row ${rowNumber}: first_name, last_name, and date_of_birth are required.`);
          continue;
        }

        const classId = resolveClassId(classValue, classes);
        if (classValue && !classId) {
          errors.push(`Row ${rowNumber}: unknown class "${classValue}".`);
          continue;
        }

        if (statusRaw && !["active", "inactive", "graduated"].includes(statusRaw)) {
          errors.push(`Row ${rowNumber}: status must be active, inactive, or graduated.`);
          continue;
        }

        parsed.push({
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob,
          class_id: classId,
          status: (statusRaw || "active") as StudentImportRow["status"],
        });
      }

      setParseErrors(errors);
      setPreview(parsed);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (preview.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setImporting(true);
    const result = await importStudentsBatch(preview, {
      school_id: schoolId,
      branch_id: branchId,
    });
    setImporting(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    setImportResult(result);
    if (result.created > 0) {
      toast.success(`Imported ${result.created} student${result.created === 1 ? "" : "s"}`);
    }
    if (result.failed > 0) {
      toast.error(`${result.failed} row${result.failed === 1 ? "" : "s"} failed`);
    }

    if (result.failed === 0 && result.created > 0) {
      router.push("/academic/students");
      router.refresh();
    }
  }

  function downloadTemplate() {
    const header = EXPECTED_HEADERS.join(",");
    const example = `Jane,Doe,2015-03-12,${classes[0]?.name ?? "Grade 1"},active`;
    const blob = new Blob([`${header}\n${example}\n`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "students-import-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
        <h2 className="font-semibold">CSV format</h2>
        <p className="mt-1 text-sm text-slate-500">
          Required columns: <code className="text-xs">first_name, last_name, date_of_birth, class, status</code>
        </p>
        <p className="mt-2 text-sm text-slate-500">
          <code className="text-xs">class</code> can be a class name or UUID.
          {classNames ? ` Available classes: ${classNames}.` : " No classes configured yet."}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          <code className="text-xs">date_of_birth</code> should be YYYY-MM-DD.
          <code className="ml-2 text-xs">status</code> is optional (defaults to active).
        </p>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={downloadTemplate}>
          Download template
        </Button>
      </div>

      <div>
        <Label htmlFor="csv-file">Upload CSV</Label>
        <input
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950/50 dark:file:text-indigo-200"
        />
        {fileName && (
          <p className="mt-1 text-xs text-slate-500">Selected: {fileName}</p>
        )}
      </div>

      {parseErrors.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-medium">Parse warnings</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {parseErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {preview.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {preview.length} row{preview.length === 1 ? "" : "s"} ready to import
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">First name</th>
                  <th className="px-3 py-2 text-left font-medium">Last name</th>
                  <th className="px-3 py-2 text-left font-medium">DOB</th>
                  <th className="px-3 py-2 text-left font-medium">Class</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((row, i) => (
                  <tr key={`${row.first_name}-${row.last_name}-${i}`} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="px-3 py-2">{row.first_name}</td>
                    <td className="px-3 py-2">{row.last_name}</td>
                    <td className="px-3 py-2">{row.date_of_birth}</td>
                    <td className="px-3 py-2">
                      {classes.find((c) => c.id === row.class_id)?.name ?? "-"}
                    </td>
                    <td className="px-3 py-2">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && (
              <p className="border-t border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-700">
                Showing first 10 of {preview.length} rows
              </p>
            )}
          </div>
        </div>
      )}

      {importResult && (
        <div className="rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-700">
          <p>
            Created <strong>{importResult.created}</strong>, failed{" "}
            <strong>{importResult.failed}</strong>
          </p>
          {importResult.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-1 text-red-600">
              {importResult.errors.map((err) => (
                <li key={`${err.row}-${err.message}`}>
                  Row {err.row}: {err.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={handleImport}
          disabled={importing || preview.length === 0}
        >
          {importing ? "Importing..." : `Import ${preview.length || ""} students`}
        </Button>
        <Link href="/academic/students">
          <Button type="button" variant="outline">
            Back to students
          </Button>
        </Link>
      </div>
    </div>
  );
}
