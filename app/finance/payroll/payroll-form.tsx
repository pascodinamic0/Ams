"use client";

import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { createPayroll, generatePayroll } from "@/lib/actions/payroll";
import {
  payrollSchema,
  payrollGenerateSchema,
  type PayrollFormData,
  type PayrollGenerateFormData,
} from "@/lib/validations/finance";
import { toast } from "@/lib/toast";

interface CreateProps {
  staff: { id: string; name: string }[];
}

export function PayrollCreateForm({ staff }: CreateProps) {
  const router = useRouter();

  async function onSubmit(data: PayrollFormData) {
    const result = await createPayroll(data);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to create payroll");
      return;
    }
    toast.success("Payroll entry created");
    router.refresh();
  }

  return (
    <FormWrapper
      schema={payrollSchema}
      defaultValues={{ amount: 0, status: "pending" }}
      onSubmit={onSubmit}
      className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <PayrollCreateFields staff={staff} />
    </FormWrapper>
  );
}

function PayrollCreateFields({ staff }: { staff: { id: string; name: string }[] }) {
  const { register, formState: { errors } } = useFormContext<PayrollFormData>();

  return (
    <>
      <div>
        <Label htmlFor="staff_id" required>Staff member</Label>
        <select
          id="staff_id"
          {...register("staff_id")}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="">Select staff</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {errors.staff_id && <p className="mt-1 text-sm text-red-500">{errors.staff_id.message}</p>}
      </div>
      <div>
        <Label htmlFor="period_start" required>Period start</Label>
        <Input id="period_start" type="date" {...register("period_start")} error={!!errors.period_start} />
        {errors.period_start && <p className="mt-1 text-sm text-red-500">{errors.period_start.message}</p>}
      </div>
      <div>
        <Label htmlFor="period_end" required>Period end</Label>
        <Input id="period_end" type="date" {...register("period_end")} error={!!errors.period_end} />
        {errors.period_end && <p className="mt-1 text-sm text-red-500">{errors.period_end.message}</p>}
      </div>
      <div>
        <Label htmlFor="amount" required>Amount</Label>
        <Input id="amount" type="number" step="0.01" {...register("amount")} error={!!errors.amount} />
        {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>}
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full">Add payroll</Button>
      </div>
    </>
  );
}

interface GenerateProps {
  schoolId?: string;
  branchId?: string;
}

export function PayrollGenerateForm({ schoolId, branchId }: GenerateProps) {
  const router = useRouter();

  async function onSubmit(data: PayrollGenerateFormData) {
    const result = await generatePayroll({ ...data, schoolId, branchId });
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to generate payroll");
      return;
    }
    const created = result.data?.created ?? 0;
    const skipped = result.data?.skipped ?? 0;
    toast.success(`Generated ${created} payroll entries${skipped ? ` (${skipped} skipped)` : ""}`);
    router.refresh();
  }

  return (
    <FormWrapper
      schema={payrollGenerateSchema}
      defaultValues={{ amount: 0 }}
      onSubmit={onSubmit}
      className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <GenerateFields />
    </FormWrapper>
  );
}

function GenerateFields() {
  const { register, formState: { errors } } = useFormContext<PayrollGenerateFormData>();

  return (
    <>
      <div>
        <Label htmlFor="gen_period_start" required>Period start</Label>
        <Input id="gen_period_start" type="date" {...register("period_start")} error={!!errors.period_start} />
        {errors.period_start && <p className="mt-1 text-sm text-red-500">{errors.period_start.message}</p>}
      </div>
      <div>
        <Label htmlFor="gen_period_end" required>Period end</Label>
        <Input id="gen_period_end" type="date" {...register("period_end")} error={!!errors.period_end} />
        {errors.period_end && <p className="mt-1 text-sm text-red-500">{errors.period_end.message}</p>}
      </div>
      <div>
        <Label htmlFor="gen_amount" required>Amount per staff</Label>
        <Input id="gen_amount" type="number" step="0.01" {...register("amount")} error={!!errors.amount} />
        {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>}
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full">Generate payroll</Button>
      </div>
    </>
  );
}
