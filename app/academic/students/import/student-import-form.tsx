"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
  canOverrideCapacity?: boolean;
}

const EXPECTED_HEADERS = ["first_name", "middle_name", "last_name", "date_of_birth", "class", "status"] as const;
const REQUIRED_HEADERS = ["first_name", "last_name", "date_of_birth", "class"] as const;

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

export function StudentImportForm({
  schoolId,
  branchId,
  classes,
  canOverrideCapacity = false,
}: Props) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<StudentImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [overrideCapacity, setOverrideCapacity] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: number;
    failed: number;
    errors: { row: number; message: string }[];
  } | null>(null);

  const classNames = useMemo(() => classes.map((c) => c.name).join(", "), [classes]);

  function statusLabel(status: StudentImportRow["status"]) {
    if (status === "active") return tc("active");
    if (status === "inactive") return tc("inactive");
    if (status === "graduated") return t("statusGraduated");
    return status;
  }

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
        setParseErrors([t("csvMustHaveRows")]);
        return;
      }

      const headers = rows[0].map(normalizeHeader);
      const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
      if (missing.length > 0) {
        setParseErrors([t("csvMissingColumns", { columns: missing.join(", ") })]);
        return;
      }

      const index = Object.fromEntries(headers.map((h, i) => [h, i]));
      const parsed: StudentImportRow[] = [];
      const errors: string[] = [];

      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i];
        const rowNumber = i + 1;
        const firstName = cells[index.first_name] ?? "";
        const middleName = index.middle_name !== undefined ? (cells[index.middle_name] ?? "") : "";
        const lastName = cells[index.last_name] ?? "";
        const dob = cells[index.date_of_birth] ?? "";
        const classValue = cells[index.class] ?? "";
        const statusRaw = (cells[index.status] ?? "active").toLowerCase();

        if (!firstName && !lastName && !dob) continue;

        if (!firstName || !lastName || !dob) {
          errors.push(t("csvRowRequiredFields", { row: rowNumber }));
          continue;
        }

        if (!classValue.trim()) {
          errors.push(t("csvClassRequired", { row: rowNumber }));
          continue;
        }

        const classId = resolveClassId(classValue, classes);
        if (!classId) {
          errors.push(t("csvUnknownClass", { row: rowNumber, className: classValue }));
          continue;
        }

        if (statusRaw && !["active", "inactive", "graduated"].includes(statusRaw)) {
          errors.push(t("csvInvalidStatus", { row: rowNumber }));
          continue;
        }

        parsed.push({
          first_name: firstName,
          middle_name: middleName || undefined,
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
      toast.error(t("noValidRows"));
      return;
    }

    setImporting(true);
    const result = await importStudentsBatch(preview, {
      school_id: schoolId,
      branch_id: branchId,
      overrideCapacity: overrideCapacity && canOverrideCapacity,
    });
    setImporting(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    setImportResult(result);
    if (result.created > 0) {
      toast.success(t("importedStudents", { count: result.created }));
    }
    if (result.failed > 0) {
      toast.error(t("importFailedRows", { count: result.failed }));
    }

    if (result.failed === 0 && result.created > 0) {
      router.push("/academic/students");
      router.refresh();
    }
  }

  function downloadTemplate() {
    const header = EXPECTED_HEADERS.join(",");
    const example = `Jane,Marie,Doe,2015-03-12,${classes[0]?.name ?? "Grade 1"},active`;
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
      <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-700">
        <h2 className="font-semibold">{t("csvFormat")}</h2>
        <p className="mt-1 text-sm text-stone-500">
          {t("csvColumns")} <code className="text-xs">first_name, middle_name, last_name, date_of_birth, class, status</code>
        </p>
        <p className="mt-2 text-sm text-stone-500">
          {t("csvMiddleNameOptional")}{" "}
          {t("csvClassHint")}
          {classNames ? ` ${t("csvAvailableClasses", { classes: classNames })}` : ` ${t("csvNoClasses")}`}
        </p>
        <p className="mt-2 text-sm text-stone-500">
          {t("csvDateFormat")}{" "}
          {t("csvStatusOptional")}
        </p>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={downloadTemplate}>
          {t("downloadTemplate")}
        </Button>
      </div>

      <div>
        <Label htmlFor="csv-file">{t("uploadCsv")}</Label>
        <input
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-light file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-hover hover:file:bg-primary-light dark:file:bg-teal-950/50 dark:file:text-teal-200"
        />
        {fileName && (
          <p className="mt-1 text-xs text-stone-500">{t("selectedFile", { fileName })}</p>
        )}
      </div>

      {parseErrors.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-medium">{t("parseWarnings")}</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {parseErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {preview.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
            {t("rowsReady", { count: preview.length })}
          </p>
          <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-stone-100 dark:bg-stone-800">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">{t("firstName")}</th>
                  <th className="px-3 py-2 text-left font-medium">{t("middleName")}</th>
                  <th className="px-3 py-2 text-left font-medium">{t("lastName")}</th>
                  <th className="px-3 py-2 text-left font-medium">{t("dob")}</th>
                  <th className="px-3 py-2 text-left font-medium">{t("class")}</th>
                  <th className="px-3 py-2 text-left font-medium">{tc("status")}</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((row, i) => (
                  <tr key={`${row.first_name}-${row.last_name}-${i}`} className="border-t border-stone-200 dark:border-stone-700">
                    <td className="px-3 py-2">{row.first_name}</td>
                    <td className="px-3 py-2">{row.middle_name || tc("emptyDash")}</td>
                    <td className="px-3 py-2">{row.last_name}</td>
                    <td className="px-3 py-2">{row.date_of_birth}</td>
                    <td className="px-3 py-2">
                      {classes.find((c) => c.id === row.class_id)?.name ?? tc("emptyDash")}
                    </td>
                    <td className="px-3 py-2">{statusLabel(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && (
              <p className="border-t border-stone-200 px-3 py-2 text-xs text-stone-500 dark:border-stone-700">
                {t("showingFirstRows", { count: preview.length })}
              </p>
            )}
          </div>
        </div>
      )}

      {importResult && (
        <div className="rounded-lg border border-stone-200 p-4 text-sm dark:border-stone-700">
          <p>
            {t("importResult", { created: importResult.created, failed: importResult.failed })}
          </p>
          {importResult.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-1 text-red-600">
              {importResult.errors.map((err) => (
                <li key={`${err.row}-${err.message}`}>
                  {t("importRowError", { row: err.row, message: err.message })}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {canOverrideCapacity ? (
        <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
          <input
            type="checkbox"
            className="rounded border-stone-300"
            checked={overrideCapacity}
            onChange={(e) => setOverrideCapacity(e.target.checked)}
          />
          {t("enrollAnywayFullClass")}
        </label>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={handleImport}
          disabled={importing || preview.length === 0}
        >
          {importing ? t("importing") : t("importStudentsCount", { count: preview.length })}
        </Button>
        <Link href="/academic/students">
          <Button type="button" variant="outline">
            {t("backToStudents")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
