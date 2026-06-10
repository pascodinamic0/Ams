import { z } from "zod";

const optionalUuid = z.union([z.string().uuid(), z.literal("")]).optional();

export const studentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string().optional(),
  class_id: optionalUuid,
  status: z.enum(["active", "graduated", "inactive"]).default("active"),
  home_address: z.string().optional(),
  notes: z.string().optional(),
});

export type StudentFormData = z.infer<typeof studentSchema>;
