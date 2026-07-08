import { z } from "zod";

export const feeStructureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  branch_id: z.string().uuid("Branch is required"),
  amount: z.coerce.number().min(0, "Amount must be zero or positive"),
  class_id: z.string().uuid().optional().or(z.literal("")),
  description: z.string().optional(),
});

export const invoiceSchema = z.object({
  student_id: z.string().uuid("Student is required"),
  fee_structure_id: z.string().uuid().optional().or(z.literal("")),
  amount: z.coerce.number().min(0, "Amount must be zero or positive"),
  due_date: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
});

export const paymentSchema = z.object({
  invoice_id: z.string().uuid("Invoice is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
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
});

export const expenseSchema = z.object({
  branch_id: z.string().uuid("Branch is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(0, "Amount must be zero or positive"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

export const payrollSchema = z.object({
  staff_id: z.string().uuid("Staff member is required"),
  period_start: z.string().min(1, "Start date is required"),
  period_end: z.string().min(1, "End date is required"),
  amount: z.coerce.number().min(0, "Amount must be zero or positive"),
  status: z.enum(["pending", "paid"]).optional(),
});

export const payrollGenerateSchema = z.object({
  month: z.coerce.number().int().min(1, "Month is required").max(12, "Month is invalid"),
  year: z.coerce.number().int().min(2000, "Year is required").max(2100, "Year is invalid"),
});

export const payrollPaymentSchema = z.object({
  amount: z.coerce.number().min(0, "Amount must be zero or positive"),
  payment_date: z.string().min(1, "Payment date is required"),
  payment_method: z.enum(["cash", "bank", "mobile_money"], {
    errorMap: () => ({ message: "Payment method is required" }),
  }),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

export type FeeStructureFormData = z.infer<typeof feeStructureSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type PayrollFormData = z.infer<typeof payrollSchema>;
export type PayrollGenerateFormData = z.infer<typeof payrollGenerateSchema>;
export type PayrollPaymentFormData = z.infer<typeof payrollPaymentSchema>;
