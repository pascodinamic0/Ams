"use client";

import { useMemo, useState } from "react";
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
};

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
      if (result.error) {
        toast.error(
          typeof result.error === "string" ? result.error : t("invoiceCreateFailed")
        );
        return;
      }
      toast.success(t("billAllSuccess", { count: result.data?.created ?? 0 }));
      router.refresh();
      return;
    }

    const result = isEdit
      ? await updateInvoice(invoice!.id, data)
      : await createInvoice(data);

    if (result.error) {
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
  const {
    register,
    formState: { errors, isSubmitting },
    setValue,
  } = useFormContext<InvoiceFormData>();
  const selectedStructureId = useWatch({ name: "fee_structure_id" });
  const [studentQuery, setStudentQuery] = useState("");

  const filteredStudents = useMemo(() => {
    const term = studentQuery.trim().toLowerCase();
    if (!term) return students;
    return students.filter((s) => {
      const haystack = `${s.name} ${s.student_id ?? ""} ${s.class_name ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [students, studentQuery]);

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
        <div className="sm:col-span-2 lg:col-span-1">
          <Label htmlFor="student_search">{t("colStudent")}</Label>
          <Input
            id="student_search"
            value={studentQuery}
            onChange={(e) => setStudentQuery(e.target.value)}
            placeholder={t("searchStudentsPlaceholder")}
            className="mb-2"
          />
          <Label htmlFor="student_id" required>
            {t("selectStudent")}
          </Label>
          <select
            id="student_id"
            {...register("student_id")}
            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
          >
            <option value="">{t("selectStudent")}</option>
            {filteredStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.student_id ? ` (${s.student_id})` : ""}
                {s.class_name ? ` · ${s.class_name}` : ""}
              </option>
            ))}
          </select>
          {filteredStudents.length === 0 ? (
            <p className="mt-1 text-sm text-stone-500">{t("noStudentsMatchSearch")}</p>
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
