import { z } from "zod";

export const invoiceSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  amount: z.number().min(0, "Amount must be positive"),
  due_date: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
