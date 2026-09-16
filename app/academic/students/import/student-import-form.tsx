"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { importStudentsBatch } from "@/lib/actions/students-import";
import { formatStudentStatusLabel } from "@/lib/students/status";
import {
  downloadStudentImportExcelTemplate,
  normalizeImportDate,
  normalizeImportHeader,
  readImportRowsFromFile,
  resolveImportClassId,
  STUDENT_IMPORT_HEADERS,
  STUDENT_IMPORT_REQUIRED_HEADERS,
} from "@/lib/students/import-file";
import type { StudentImportRow } from "@/lib/validations/academic";
import { STUDENT_STATUSES } from "@/lib/validations/student";
import { toast } from "@/lib/toast";

type ClassOption = { id: string; name: string };

interface Props {
  schoolId: string;
  branchId: string;
  classes: ClassOption[];
  canOverrideCapacity?: boolean;
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
    return formatStudentStatusLabel(status, {
      active: tc("active"),
      pending: tc("pending"),
      inactive: tc("inactive"),
      graduated: t("statusGraduated"),
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setImportResult(null);
    setPreview([]);
    setParseErrors([]);

    if (!file) {
      setFileName(null);
      return;
    }

    setFileName(file.name);

    try {
      const rows = await readImportRowsFromFile(file);

      if (rows.length < 2) {
        setParseErrors([t("csvMustHaveRows")]);
        return;
      }

      const headers = rows[0].map(normalizeImportHeader);
      const missing = STUDENT_IMPORT_REQUIRED_HEADERS.filter(
        (h) => !headers.includes(h)
      );
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
        const firstName = (cells[index.first_name] ?? "").trim();
        const middleName =
          index.middle_name !== undefined
            ? (cells[index.middle_name] ?? "").trim()
            : "";
        const lastName = (cells[index.last_name] ?? "").trim();
        const dobRaw = cells[index.date_of_birth] ?? "";
        const classValue = (cells[index.class] ?? "").trim();
        const feeStructureRaw =
          index.fee_structure !== undefined
            ? (cells[index.fee_structure] ?? "").trim()
            : "";
        const receiptRef =
          index.enrollment_receipt_ref !== undefined
            ? (cells[index.enrollment_receipt_ref] ?? "").trim()
            : "";
        const statusRaw = (cells[index.status] ?? "pending").trim().toLowerCase();

        if (!firstName && !lastName && !String(dobRaw).trim()) continue;

        if (!firstName || !lastName || !String(dobRaw).trim()) {
          errors.push(t("csvRowRequiredFields", { row: rowNumber }));
          continue;
        }

        const dob = normalizeImportDate(dobRaw);
        if (!dob) {
          errors.push(t("csvInvalidDate", { row: rowNumber }));
          continue;
        }

        if (!classValue) {
          errors.push(t("csvClassRequired", { row: rowNumber }));
          continue;
        }

        const classId = resolveImportClassId(classValue, classes);
        if (!classId) {
          errors.push(t("csvUnknownClass", { row: rowNumber, className: classValue }));
          continue;
        }

        if (statusRaw && !(STUDENT_STATUSES as readonly string[]).includes(statusRaw)) {
          errors.push(t("csvInvalidStatus", { row: rowNumber }));
          continue;
        }

        parsed.push({
          first_name: firstName,
          middle_name: middleName || undefined,
          last_name: lastName,
          date_of_birth: dob,
          class_id: classId,
          status: (statusRaw || "pending") as StudentImportRow["status"],
          fee_structure: feeStructureRaw || undefined,
          enrollment_receipt_ref: receiptRef || undefined,
        });
      }

      setParseErrors(errors);
      setPreview(parsed);
    } catch {
      setParseErrors([t("csvParseFailed")]);
      setPreview([]);
    }
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
    downloadStudentImportExcelTemplate(classes[0]?.name ?? "Grade 1");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-700">
        <h2 className="font-semibold">{t("csvFormat")}</h2>
        <p className="mt-1 text-sm text-stone-500">
          {t("csvColumns")}{" "}
          <code className="text-xs">{STUDENT_IMPORT_HEADERS.join(", ")}</code>
        </p>
        <p className="mt-2 text-sm text-stone-500">
          {t("csvMiddleNameOptional")} {t("csvClassHint")}
          {classNames
            ? ` ${t("csvAvailableClasses", { classes: classNames })}`
            : ` ${t("csvNoClasses")}`}
        </p>
        <p className="mt-2 text-sm text-stone-500">
          {t("csvDateFormat")} {t("csvStatusOptional")}
        </p>
        <p className="mt-2 text-sm text-stone-500">{t("csvExcelHint")}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Label htmlFor="csv-file">{t("uploadCsv")}</Label>
          <input
            id="csv-file"
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-light file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-hover hover:file:bg-primary-light dark:file:bg-teal-950/50 dark:file:text-teal-200"
          />
          {fileName && (
            <p className="mt-1 text-xs text-stone-500">
              {t("selectedFile", { fileName })}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          onClick={downloadTemplate}
        >
          {t("downloadExcelTemplate")}
        </Button>
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
                  <tr
                    key={`${row.first_name}-${row.last_name}-${i}`}
                    className="border-t border-stone-200 dark:border-stone-700"
                  >
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
            {t("importResult", {
              created: importResult.created,
              failed: importResult.failed,
            })}
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
          {importing
            ? t("importing")
            : t("importStudentsCount", { count: preview.length })}
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
