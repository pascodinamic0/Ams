import { z } from "zod";

export const guardianSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  relation: z.enum(["father", "mother", "guardian", "other"]).default("guardian"),
});

export type GuardianFormData = z.infer<typeof guardianSchema>;
