"use client";

import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { createExpense, updateExpense } from "@/lib/actions/expenses";
import { expenseSchema, type ExpenseFormData } from "@/lib/validations/finance";
import { toast } from "@/lib/toast";
import type { ExpenseListItem } from "@/lib/db";

const DEFAULT_CATEGORIES = [
  "Utilities",
  "Supplies",
  "Maintenance",
  "Transport",
  "Salaries",
  "Other",
];

interface Props {
  branchId: string;
  categories: string[];
  expense?: ExpenseListItem;
}

export function ExpenseForm({ branchId, categories, expense }: Props) {
  const router = useRouter();
  const isEdit = Boolean(expense);

  async function onSubmit(data: ExpenseFormData) {
    const payload = { ...data, branch_id: branchId };
    const result = isEdit
      ? await updateExpense(expense!.id, payload)
      : await createExpense(payload);

    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Failed to save expense");
      return;
    }

    toast.success(isEdit ? "Expense updated" : "Expense recorded");
    router.refresh();
  }

  const categoryOptions = [...new Set([...DEFAULT_CATEGORIES, ...categories])];

  return (
    <FormWrapper
      schema={expenseSchema}
      defaultValues={{
        branch_id: branchId,
        category: expense?.category ?? "",
        amount: expense?.amount ?? 0,
        description: expense?.description ?? "",
        date: expense?.date ?? new Date().toISOString().slice(0, 10),
      }}
      onSubmit={onSubmit}
      className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <ExpenseFields categories={categoryOptions} isEdit={isEdit} />
    </FormWrapper>
  );
}

function ExpenseFields({
  categories,
  isEdit,
}: {
  categories: string[];
  isEdit: boolean;
}) {
  const { register, formState: { errors } } = useFormContext<ExpenseFormData>();

  return (
    <>
      <div>
        <Label htmlFor="category" required>Category</Label>
        <Input
          id="category"
          list="expense-categories"
          {...register("category")}
          error={!!errors.category}
        />
        <datalist id="expense-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>}
      </div>
      <div>
        <Label htmlFor="amount" required>Amount</Label>
        <Input id="amount" type="number" step="0.01" {...register("amount")} error={!!errors.amount} />
        {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>}
      </div>
      <div>
        <Label htmlFor="date" required>Date</Label>
        <Input id="date" type="date" {...register("date")} error={!!errors.date} />
        {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>}
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} />
      </div>
      <div className="flex items-end">
        <Button type="submit" className="w-full">
          {isEdit ? "Update expense" : "Add expense"}
        </Button>
      </div>
    </>
  );
}
