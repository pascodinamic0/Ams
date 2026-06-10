import { z } from "zod";
import { studentSchema } from "./student";

/** Optional UUID fields from <select> placeholders submit as "". */
const optionalUuid = z.union([z.string().uuid(), z.literal("")]).optional();

export const guardianOnboardingSchema = z.object({
  name: z.string().min(1, "Guardian name is required"),
  email: z.string().email("Invalid email"),
  whatsapp: z.string().optional(),
  relation: z.enum(["father", "mother", "guardian", "other"]).default("guardian"),
  address: z.string().optional(),
  workplace: z.string().optional(),
});

export const studentOnboardingSchema = studentSchema.extend({
  home_address: z.string().optional(),
  notes: z.string().optional(),
  same_address_as_guardian: z.boolean().optional(),
  existing_guardian_id: optionalUuid,
  primary_guardian: guardianOnboardingSchema.optional(),
  add_secondary_guardian: z.boolean().default(false),
  secondary_guardian: guardianOnboardingSchema.optional(),
}).superRefine((data, ctx) => {
  const hasPrimary =
    Boolean(data.existing_guardian_id) ||
    Boolean(data.primary_guardian?.name?.trim());
  if (!hasPrimary) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Primary guardian details are required",
      path: ["primary_guardian", "name"],
    });
  }
  if (data.add_secondary_guardian && !data.secondary_guardian?.name?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Secondary guardian details are required",
      path: ["secondary_guardian", "name"],
    });
  }
});

export type GuardianOnboardingData = z.infer<typeof guardianOnboardingSchema>;
export type StudentOnboardingData = z.infer<typeof studentOnboardingSchema>;
