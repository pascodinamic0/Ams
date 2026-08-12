import { z } from "zod";

export const guardianSchema = z.object({
  first_name: z.string().min(1, "firstNameRequired"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "lastNameRequired"),
  email: z.string().email("invalidEmail"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  relation: z.enum(["father", "mother", "guardian", "other"]).default("guardian"),
  address: z.string().optional(),
  workplace: z.string().optional(),
});

export type GuardianFormData = z.infer<typeof guardianSchema>;
