import { z } from "zod";

export const feeStructureSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  branch_id: z.string().uuid("branchRequired"),
  amount: z.coerce.number().min(0, "amountZeroOrPositive"),
  class_id: z.string().uuid().optional().or(z.literal("")),
  description: z.string().optional(),
  school_year: z.coerce.number().int().min(2000).max(2100),
});

export const invoiceSchema = z.object({
  student_id: z.string().uuid("studentRequired"),
  fee_structure_id: z.string().uuid().optional().or(z.literal("")),
  amount: z.coerce.number().min(0, "amountZeroOrPositive"),
  due_date: z.string().min(1, "dueDateRequired"),
  description: z.string().optional(),
});

export const paymentSchema = z.object({
  invoice_id: z.string().uuid("invoiceRequired"),
  amount: z.coerce.number().positive("amountGreaterThanZero"),
  method: z.enum([
    "cash",
    "bank_transfer",
    "card",
    "mobile_money",
    "online",
    "other",
  ]),
  reference: z.string().optional(),
  paid_at: z.string().optional(),
  proof_url: z.string().url().optional().or(z.literal("")),
});

export const expenseSchema = z.object({
  branch_id: z.string().uuid("branchRequired"),
  category: z.string().min(1, "categoryRequired"),
  amount: z.coerce.number().min(0, "amountZeroOrPositive"),
  description: z.string().optional(),
  date: z.string().min(1, "dateRequired"),
});

export const payrollSchema = z.object({
  staff_id: z.string().uuid("staffRequired"),
  period_start: z.string().min(1, "startDateRequired"),
  period_end: z.string().min(1, "endDateRequired"),
  amount: z.coerce.number().min(0, "amountZeroOrPositive"),
  status: z.enum(["pending", "paid"]).optional(),
});

export const payrollGenerateSchema = z.object({
  month: z.coerce.number().int().min(1, "monthRequired").max(12, "monthInvalid"),
  year: z.coerce.number().int().min(2000, "yearRequired").max(2100, "yearInvalid"),
});

export const payrollPaymentSchema = z.object({
  amount: z.coerce.number().min(0, "amountZeroOrPositive"),
  payment_date: z.string().min(1, "paymentDateRequired"),
  payment_method: z.enum(["cash", "bank", "mobile_money"], {
    message: "paymentMethodRequired",
  }),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

/** `year` is the school-year start (e.g. 2026 for 2026 - 2027). */
export const budgetPlanSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  title: z.string().min(1, "titleRequired"),
  label: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
});

export const budgetLineItemSchema = z.object({
  category: z.string().min(1, "categoryRequired"),
  name: z.string().min(1, "itemNameRequired"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(0, "quantityZeroOrPositive"),
  unit_cost: z.coerce.number().min(0, "unitCostZeroOrPositive"),
  period_type: z.enum(["year", "quarter", "trimester", "month"]),
  period_key: z.string().min(1, "periodRequired"),
  sort_order: z.coerce.number().int().optional(),
  status: z.enum(["planned", "in_progress", "done", "cancelled"]).optional(),
});

export type FeeStructureFormData = z.infer<typeof feeStructureSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type PayrollFormData = z.infer<typeof payrollSchema>;
export type PayrollGenerateFormData = z.infer<typeof payrollGenerateSchema>;
export type PayrollPaymentFormData = z.infer<typeof payrollPaymentSchema>;
export type BudgetPlanFormData = z.infer<typeof budgetPlanSchema>;
export type BudgetLineItemFormData = z.infer<typeof budgetLineItemSchema>;
