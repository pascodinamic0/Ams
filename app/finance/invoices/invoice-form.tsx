"use client";

import { useRouter } from "next/navigation";
import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { createInvoice } from "@/lib/actions/invoices";
import { invoiceSchema, type InvoiceFormData } from "@/lib/validations/finance";
import { toast } from "@/lib/toast";

interface Props {
  students: { id: string; name: string; student_id: string | null }[];
  feeStructures: { id: string; name: string; amount: number }[];
}

export function InvoiceForm({ students, feeStructures }: Props) {
  const router = useRouter();

  async function onSubmit(data: InvoiceFormData) {
    const result = await createInvoice(data);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to create invoice");
      return;
    }
    toast.success("Invoice created");
    router.refresh();
  }

  return (
    <FormWrapper
      schema={invoiceSchema}
      onSubmit={onSubmit}
      className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <InvoiceFormFields students={students} feeStructures={feeStructures} />
    </FormWrapper>
  );
}

function InvoiceFormFields({
  students,
  feeStructures,
}: {
  students: { id: string; name: string; student_id: string | null }[];
  feeStructures: { id: string; name: string; amount: number }[];
}) {
  const { register, formState: { errors }, setValue } = useFormContext<InvoiceFormData>();
  const selectedStructureId = useWatch({ name: "fee_structure_id" });

  function onStructureChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setValue("fee_structure_id", id);
    const structure = feeStructures.find((s) => s.id === id);
    if (structure) setValue("amount", structure.amount);
  }

  return (
    <>
      <div>
        <Label htmlFor="student_id" required>Student</Label>
        <select
          id="student_id"
          {...register("student_id")}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="">Select student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}{s.student_id ? ` (${s.student_id})` : ""}
            </option>
          ))}
        </select>
        {errors.student_id && <p className="mt-1 text-sm text-red-500">{errors.student_id.message}</p>}
      </div>
      <div>
        <Label htmlFor="fee_structure_id">Fee structure</Label>
        <select
          id="fee_structure_id"
          value={selectedStructureId ?? ""}
          onChange={onStructureChange}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="">Custom amount</option>
          {feeStructures.map((s) => (
            <option key={s.id} value={s.id}>{s.name} - {s.amount}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="amount" required>Amount</Label>
        <Input id="amount" type="number" step="0.01" {...register("amount")} error={!!errors.amount} />
        {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>}
      </div>
      <div>
        <Label htmlFor="due_date" required>Due date</Label>
        <Input id="due_date" type="date" {...register("due_date")} error={!!errors.due_date} />
        {errors.due_date && <p className="mt-1 text-sm text-red-500">{errors.due_date.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} />
      </div>
      <div className="flex items-end sm:col-span-2 lg:col-span-1">
        <Button type="submit" className="w-full">Create invoice</Button>
      </div>
    </>
  );
}
