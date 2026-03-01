import { z } from "zod";

export const studentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  class_id: z.string().optional(),
  status: z.enum(["active", "graduated", "inactive"]).default("active"),
});

export type StudentFormData = z.infer<typeof studentSchema>;
