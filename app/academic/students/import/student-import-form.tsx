"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { importStudentsBatch } from "@/lib/actions/students-import";
import {
  displayImportHeader,
  downloadStudentImportExcelTemplate,
  getStudentImportDisplayHeaders,
  mapImportHeaders,
  normalizeImportDate,
  parseImportGender,
  readImportRowsFromFile,
  resolveImportClassId,
  STUDENT_IMPORT_REQUIRED_HEADERS,
  type StudentImportHeader,
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

function cellAt(
  cells: string[],
  index: Record<string, number>,
  key: string
): string {
  const i = index[key];
  if (i === undefined) return "";
  return String(cells[i] ?? "").trim();
}

export function StudentImportForm({
  schoolId,
  branchId,
  classes,
  canOverrideCapacity = false,
}: Props) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const locale = useLocale();
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
  const displayHeaders = useMemo(
    () => getStudentImportDisplayHeaders(locale),
    [locale]
  );
  const requiredLabels = useMemo(
    () =>
      STUDENT_IMPORT_REQUIRED_HEADERS.map((key) =>
        displayImportHeader(key, locale)
      ).join(", "),
    [locale]
  );

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

      const index = mapImportHeaders(rows[0]);
      const missing = STUDENT_IMPORT_REQUIRED_HEADERS.filter(
        (h) => index[h] === undefined
      );
      if (missing.length > 0) {
        setParseErrors([
          t("csvMissingColumns", {
            columns: missing
              .map((key) => displayImportHeader(key, locale))
              .join(", "),
          }),
        ]);
        return;
      }

      const parsed: StudentImportRow[] = [];
      const errors: string[] = [];

      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i];
        const rowNumber = i + 1;
        const firstName = cellAt(cells, index, "first_name");
        const middleName = cellAt(cells, index, "middle_name");
        const lastName = cellAt(cells, index, "last_name");
        const genderRaw = cellAt(cells, index, "gender");
        const placeOfBirth = cellAt(cells, index, "place_of_birth");
        const dobRaw = cellAt(cells, index, "date_of_birth");
        const previousSchool = cellAt(cells, index, "previous_school");
        const parentName = cellAt(cells, index, "parent_name");
        const parentPhone = cellAt(cells, index, "parent_phone");
        const address = cellAt(cells, index, "address");
        const classValue = cellAt(cells, index, "class");
        const feeStructureRaw = cellAt(cells, index, "fee_structure");
        const receiptRef = cellAt(cells, index, "enrollment_receipt_ref");
        const statusRaw =
          cellAt(cells, index, "status").toLowerCase() || "pending";

        if (!firstName && !lastName && !dobRaw) continue;

        if (!firstName || !lastName || !dobRaw) {
          errors.push(t("csvRowRequiredFields", { row: rowNumber }));
          continue;
        }

        const dob = normalizeImportDate(dobRaw);
        if (!dob) {
          errors.push(t("csvInvalidDate", { row: rowNumber }));
          continue;
        }

        let gender: StudentImportRow["gender"];
        if (genderRaw) {
          gender = parseImportGender(genderRaw);
          if (!gender) {
            errors.push(t("csvInvalidGender", { row: rowNumber }));
            continue;
          }
        }

        if (!classValue) {
          errors.push(t("csvClassRequired", { row: rowNumber }));
          continue;
        }

        const classId = resolveImportClassId(classValue, classes);
        if (!classId) {
          errors.push(
            t("csvUnknownClass", { row: rowNumber, className: classValue })
          );
          continue;
        }

        if (
          statusRaw &&
          !(STUDENT_STATUSES as readonly string[]).includes(statusRaw)
        ) {
          errors.push(t("csvInvalidStatus", { row: rowNumber }));
          continue;
        }

        parsed.push({
          first_name: firstName,
          middle_name: middleName || undefined,
          last_name: lastName,
          gender,
          place_of_birth: placeOfBirth || undefined,
          date_of_birth: dob,
          previous_school: previousSchool || undefined,
          parent_name: parentName || undefined,
          parent_phone: parentPhone || undefined,
          address: address || undefined,
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
    downloadStudentImportExcelTemplate(
      classes[0]?.name ?? (locale.startsWith("fr") ? "1ère A" : "Grade 1"),
      locale
    );
  }

  const previewColumns: {
    key: StudentImportHeader;
    render: (row: StudentImportRow) => string;
  }[] = [
    { key: "first_name", render: (row) => row.first_name },
    { key: "middle_name", render: (row) => row.middle_name || tc("emptyDash") },
    { key: "last_name", render: (row) => row.last_name },
    {
      key: "gender",
      render: (row) =>
        row.gender === "male"
          ? "M"
          : row.gender === "female"
            ? "F"
            : tc("emptyDash"),
    },
    {
      key: "place_of_birth",
      render: (row) => row.place_of_birth || tc("emptyDash"),
    },
    { key: "date_of_birth", render: (row) => row.date_of_birth },
    {
      key: "previous_school",
      render: (row) => row.previous_school || tc("emptyDash"),
    },
    { key: "parent_name", render: (row) => row.parent_name || tc("emptyDash") },
    {
      key: "parent_phone",
      render: (row) => row.parent_phone || tc("emptyDash"),
    },
    { key: "address", render: (row) => row.address || tc("emptyDash") },
    {
      key: "class",
      render: (row) =>
        classes.find((c) => c.id === row.class_id)?.name ?? tc("emptyDash"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-700">
        <h2 className="font-semibold">{t("csvFormat")}</h2>
        <p className="mt-1 text-sm text-stone-500">
          {t("csvColumns")}{" "}
          <code className="text-xs">{displayHeaders.join(", ")}</code>
        </p>
        <p className="mt-2 text-sm text-stone-500">
          {t("csvRequiredColumns", { columns: requiredLabels })} {t("csvClassHint")}
          {classNames
            ? ` ${t("csvAvailableClasses", { classes: classNames })}`
            : ` ${t("csvNoClasses")}`}
        </p>
        <p className="mt-2 text-sm text-stone-500">
          {t("csvDateFormat")} {t("csvGenderHint")} {t("csvOptionalContactFields")}
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
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-stone-100 dark:bg-stone-800">
                <tr>
                  {previewColumns.map((col) => (
                    <th
                      key={col.key}
                      className="px-3 py-2 text-left font-medium"
                    >
                      {displayImportHeader(col.key, locale)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((row, i) => (
                  <tr
                    key={`${row.first_name}-${row.last_name}-${i}`}
                    className="border-t border-stone-200 dark:border-stone-700"
                  >
                    {previewColumns.map((col) => (
                      <td key={col.key} className="px-3 py-2">
                        {col.render(row)}
                      </td>
                    ))}
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
