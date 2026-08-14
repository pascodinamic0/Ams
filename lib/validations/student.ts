import { z } from "zod";

export const studentSchema = z.object({
  first_name: z.string().min(1, "firstNameRequired"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "lastNameRequired"),
  date_of_birth: z.string().min(1, "dobRequired"),
  gender: z.string().optional(),
  class_id: z.string().uuid("classRequired"),
  status: z.enum(["active", "graduated", "inactive"]).default("active"),
  home_address: z.string().optional(),
  notes: z.string().optional(),
  photo_url: z.string().url("invalidPhotoUrl").optional().or(z.literal("")),
});

export type StudentFormData = z.infer<typeof studentSchema>;
