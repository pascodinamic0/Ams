"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormWrapper } from "@/components/forms/form-wrapper";
import {
  createInvoice,
  generateInvoicesFromFeeStructure,
  searchInvoiceStudents,
  updateInvoice,
} from "@/lib/actions/invoices";
import { invoiceSchema, type InvoiceFormData } from "@/lib/validations/finance";
import { formatSchoolYear } from "@/lib/academic/school-year";
import { toast } from "@/lib/toast";

type StudentOption = {
  id: string;
  name: string;
  student_id: string | null;
  class_name: string | null;
  status?: string;
};

const SUGGESTION_LIMIT = 8;

function studentSearchRank(student: StudentOption, term: string) {
  const name = student.name.toLowerCase();
  if (name.startsWith(term)) return 0;
  if (name.split(/\s+/).some((part) => part.startsWith(term))) return 1;
  if (name.includes(term)) return 2;
  return 3;
}

function HighlightMatch({ text, term }: { text: string; term: string }) {
  const needle = term.trim();
  if (!needle) return text;
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <span className="font-semibold text-foreground">
        {text.slice(index, index + needle.length)}
      </span>
      {text.slice(index + needle.length)}
    </>
  );
}

type FeeStructureOption = {
  id: string;
  name: string;
  amount: number;
  class_id: string | null;
  class_name: string | null;
  school_year: number;
};

type EditingInvoice = {
  id: string;
  student_uuid: string;
  fee_structure_id: string | null;
  amount: number;
  due_date: string;
  description: string | null;
};

interface Props {
  students: StudentOption[];
  feeStructures: FeeStructureOption[];
  invoice?: EditingInvoice | null;
}

export function InvoiceForm({ students, feeStructures, invoice }: Props) {
  const router = useRouter();
  const t = useTranslations("finance");
  const isEdit = Boolean(invoice);
  const [billingAll, setBillingAll] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  async function onSubmit(data: InvoiceFormData) {
    if (billingAll && !isEdit) {
      if (!data.fee_structure_id) {
        toast.error(t("billAllNeedsFeeStructure"));
        return;
      }
      setBulkLoading(true);
      const result = await generateInvoicesFromFeeStructure({
        fee_structure_id: data.fee_structure_id,
        due_date: data.due_date,
        description: data.description,
      });
      setBulkLoading(false);
      if ("error" in result && result.error) {
        toast.error(
          typeof result.error === "string" ? result.error : t("invoiceCreateFailed")
        );
        return;
      }
      toast.success(t("billAllSuccess", { count: "data" in result ? result.data?.created ?? 0 : 0 }));
      router.refresh();
      return;
    }

    const result = isEdit
      ? await updateInvoice(invoice!.id, data)
      : await createInvoice(data);

    if ("error" in result && result.error) {
      toast.error(
        typeof result.error === "string"
          ? result.error
          : isEdit
            ? t("invoiceUpdateFailed")
            : t("invoiceCreateFailed")
      );
      return;
    }

    toast.success(isEdit ? t("invoiceUpdated") : t("invoiceCreated"));
    if (isEdit) {
      router.push("/finance/invoices");
    }
    router.refresh();
  }

  if (students.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-sm text-stone-500">
        {t("noStudentsForInvoices")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300">
          {isEdit ? t("editInvoice") : t("createInvoice")}
        </h2>
        {isEdit ? (
          <Link
            href="/finance/invoices"
            className="text-sm text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          >
            {t("cancelEdit")}
          </Link>
        ) : null}
      </div>
      <FormWrapper
        key={invoice?.id ?? "new-invoice"}
        schema={invoiceSchema}
        defaultValues={{
          student_id: invoice?.student_uuid ?? "",
          fee_structure_id: invoice?.fee_structure_id ?? "",
          amount: invoice?.amount ?? 0,
          due_date: invoice?.due_date ?? new Date().toISOString().slice(0, 10),
          description: invoice?.description ?? "",
        }}
        onSubmit={onSubmit}
        className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <InvoiceFormFields
          students={students}
          feeStructures={feeStructures}
          isEdit={isEdit}
          billingAll={billingAll}
          onBillingAllChange={setBillingAll}
          bulkLoading={bulkLoading}
        />
      </FormWrapper>
    </div>
  );
}

function InvoiceFormFields({
  students,
  feeStructures,
  isEdit,
  billingAll,
  onBillingAllChange,
  bulkLoading,
}: {
  students: StudentOption[];
  feeStructures: FeeStructureOption[];
  isEdit: boolean;
  billingAll: boolean;
  onBillingAllChange: (value: boolean) => void;
  bulkLoading: boolean;
}) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const {
    register,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useFormContext<InvoiceFormData>();
  const selectedStructureId = useWatch({ name: "fee_structure_id" });
  const selectedStudentId = useWatch({ name: "student_id" });
  const [studentQuery, setStudentQuery] = useState(() => {
    const id = getValues("student_id");
    return students.find((student) => student.id === id)?.name ?? "";
  });
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [remoteStudents, setRemoteStudents] = useState<StudentOption[]>([]);
  const [remoteReady, setRemoteReady] = useState(false);
  const suggestRootRef = useRef<HTMLDivElement>(null);
  const activeOptionRef = useRef<HTMLButtonElement>(null);

  const studentTerm = studentQuery.trim().toLowerCase();
  const localMatches = useMemo(() => {
    if (!studentTerm) return [];
    return students
      .filter((student) => {
        const haystack = `${student.name} ${student.student_id ?? ""} ${student.class_name ?? ""}`.toLowerCase();
        return haystack.includes(studentTerm);
      })
      .sort((a, b) => {
        const rank = studentSearchRank(a, studentTerm) - studentSearchRank(b, studentTerm);
        if (rank !== 0) return rank;
        return a.name.localeCompare(b.name);
      });
  }, [students, studentTerm]);
  const pendingRemote = remoteStudents.filter((student) => {
    const haystack = `${student.name} ${student.student_id ?? ""} ${student.class_name ?? ""}`.toLowerCase();
    return haystack.includes(studentTerm);
  });
  const matchedStudents = remoteReady
    ? remoteStudents
    : pendingRemote.length > 0
      ? pendingRemote
      : localMatches;

  useEffect(() => {
    if (!studentTerm) {
      setRemoteStudents([]);
      setRemoteReady(false);
      return;
    }

    let cancelled = false;
    setRemoteReady(false);
    const handle = setTimeout(() => {
      void searchInvoiceStudents(studentQuery.trim()).then((rows) => {
        if (cancelled) return;
        setRemoteStudents(rows);
        setRemoteReady(true);
        setActiveIndex(0);
      });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [studentQuery, studentTerm]);
  const visibleStudents = matchedStudents.slice(0, SUGGESTION_LIMIT);
  const hiddenStudentCount = Math.max(0, matchedStudents.length - visibleStudents.length);
  const selectedStudent =
    students.find((student) => student.id === selectedStudentId) ??
    remoteStudents.find((student) => student.id === selectedStudentId) ??
    null;

  useEffect(() => {
    if (!suggestionsOpen) return;
    function handlePointer(event: MouseEvent) {
      if (!suggestRootRef.current?.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [suggestionsOpen]);

  useEffect(() => {
    activeOptionRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, suggestionsOpen, studentTerm]);

  const wasBillingAllRef = useRef(billingAll);
  useEffect(() => {
    if (wasBillingAllRef.current && !billingAll) {
      const id = getValues("student_id");
      const match = students.find((student) => student.id === id);
      if (match) setStudentQuery(match.name);
    }
    wasBillingAllRef.current = billingAll;
  }, [billingAll, getValues, students]);

  function selectStudent(student: StudentOption) {
    setValue("student_id", student.id, { shouldValidate: true, shouldDirty: true });
    setStudentQuery(student.name);
    setSuggestionsOpen(false);
  }

  function onStudentQueryChange(value: string) {
    setStudentQuery(value);
    setActiveIndex(0);
    const term = value.trim().toLowerCase();
    setSuggestionsOpen(term.length > 0);
    const exact = [...remoteStudents, ...students].filter(
      (student, index, pool) =>
        student.name.toLowerCase() === term &&
        pool.findIndex((item) => item.id === student.id) === index
    );
    if (exact.length === 1) {
      setValue("student_id", exact[0].id, { shouldValidate: true, shouldDirty: true });
      return;
    }
    const current = students.find((student) => student.id === getValues("student_id"));
    if (!current || current.name !== value) {
      setValue("student_id", "", { shouldValidate: false, shouldDirty: true });
    }
  }

  function onStudentQueryKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setSuggestionsOpen(false);
      return;
    }
    if (!suggestionsOpen || visibleStudents.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, visibleStudents.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && visibleStudents[activeIndex]) {
      event.preventDefault();
      selectStudent(visibleStudents[activeIndex]);
    }
  }

  function onStructureChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setValue("fee_structure_id", id, { shouldValidate: true });
    const structure = feeStructures.find((s) => s.id === id);
    if (structure) setValue("amount", structure.amount, { shouldValidate: true });
  }

  function onBillingAllToggle(checked: boolean) {
    onBillingAllChange(checked);
    if (checked && students[0]) {
      // Satisfy required student_id validation; bulk path ignores this value.
      setValue("student_id", students[0].id, { shouldValidate: true });
    }
  }

  return (
    <>
      {!isEdit ? (
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={billingAll}
              onChange={(e) => onBillingAllToggle(e.target.checked)}
              className="rounded border-stone-300"
            />
            <span>{t("billAllStudents")}</span>
          </label>
          <p className="mt-1 text-xs text-stone-500">{t("billAllStudentsHint")}</p>
        </div>
      ) : null}

      {!billingAll ? (
        <div ref={suggestRootRef} className="relative sm:col-span-2 lg:col-span-1">
          <Label htmlFor="student_search" required>
            {t("colStudent")}
          </Label>
          <input type="hidden" {...register("student_id")} />
          <div className="relative mt-1">
            <Input
              id="student_search"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={suggestionsOpen}
              aria-controls="student_search_list"
              aria-activedescendant={
                suggestionsOpen && visibleStudents[activeIndex]
                  ? `student_opt_${visibleStudents[activeIndex].id}`
                  : undefined
              }
              value={studentQuery}
              autoComplete="off"
              onChange={(e) => onStudentQueryChange(e.target.value)}
              onFocus={() => {
                if (studentQuery.trim()) setSuggestionsOpen(true);
              }}
              onKeyDown={onStudentQueryKeyDown}
              placeholder={t("searchStudentsPlaceholder")}
              className={studentQuery ? "pr-9" : undefined}
            />
            {studentQuery ? (
              <button
                type="button"
                aria-label={t("clearStudentSearch")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                onClick={() => onStudentQueryChange("")}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
            {suggestionsOpen ? (
            <ul
              id="student_search_list"
              role="listbox"
              aria-label={t("searchStudentsPlaceholder")}
              className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg"
            >
              {visibleStudents.length === 0 ? (
                <li className="px-3 py-2 text-sm text-stone-500">
                  {remoteReady ? t("noStudentsMatchSearch") : tc("loading")}
                </li>
              ) : (
                visibleStudents.map((student, index) => {
                  const statusLabel =
                    student.status === "inactive"
                      ? tc("inactive")
                      : student.status === "pending"
                        ? tc("pending")
                        : null;
                  const meta = [student.student_id, student.class_name, statusLabel]
                    .filter(Boolean)
                    .join(" · ");
                  const active = index === activeIndex;
                  return (
                    <li key={student.id} role="presentation">
                      <button
                        id={`student_opt_${student.id}`}
                        ref={active ? activeOptionRef : undefined}
                        type="button"
                        role="option"
                        aria-selected={selectedStudentId === student.id}
                        className={`flex w-full flex-col px-3 py-2 text-left text-sm ${
                          active ? "bg-stone-100 dark:bg-stone-800" : "hover:bg-stone-50 dark:hover:bg-stone-900"
                        }`}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectStudent(student)}
                      >
                        <span>
                          <HighlightMatch text={student.name} term={studentTerm} />
                        </span>
                        {meta ? <span className="text-xs text-stone-500">{meta}</span> : null}
                      </button>
                    </li>
                  );
                })
              )}
              {hiddenStudentCount > 0 ? (
                <li className="px-3 py-2 text-xs text-stone-500">
                  {t("moreStudentMatches", { count: hiddenStudentCount })}
                </li>
              ) : null}
            </ul>
            ) : null}
          </div>
          {selectedStudent && !suggestionsOpen ? (
            <p className="mt-1 text-xs text-stone-500">
              {[selectedStudent.student_id, selectedStudent.class_name].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          {errors.student_id && !billingAll ? (
            <p className="mt-1 text-sm text-red-500">{errors.student_id.message}</p>
          ) : null}
        </div>
      ) : (
        <div className="sm:col-span-2 lg:col-span-1">
          <Label>{t("colStudent")}</Label>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            {t("billAllStudentsCount", { count: students.length })}
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="fee_structure_id">
          {billingAll ? t("feeStructureRequired") : t("feeStructureOptional")}
        </Label>
        <select
          id="fee_structure_id"
          value={selectedStructureId ?? ""}
          onChange={onStructureChange}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="">{billingAll ? t("selectFeeStructure") : t("customAmount")}</option>
          {feeStructures.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {formatSchoolYear(s.school_year)} - {s.amount}
              {s.class_name ? ` (${s.class_name})` : ""}
            </option>
          ))}
        </select>
      </div>

      {!billingAll ? (
        <div>
          <Label htmlFor="amount" required>
            {t("colAmount")}
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register("amount")}
            error={!!errors.amount}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>
      ) : null}

      <div>
        <Label htmlFor="due_date" required>
          {t("colDueDate")}
        </Label>
        <Input
          id="due_date"
          type="date"
          {...register("due_date")}
          error={!!errors.due_date}
        />
        {errors.due_date && (
          <p className="mt-1 text-sm text-red-500">{errors.due_date.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">{t("invoiceDescription")}</Label>
        <Input id="description" {...register("description")} />
      </div>

      <div className="flex items-end sm:col-span-2 lg:col-span-1">
        <Button type="submit" className="w-full" disabled={bulkLoading || isSubmitting}>
          {isEdit
            ? t("saveInvoice")
            : billingAll
              ? t("billAllAction")
              : t("createInvoice")}
        </Button>
      </div>
    </>
  );
}
