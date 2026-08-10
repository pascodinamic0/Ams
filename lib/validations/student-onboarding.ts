import { z } from "zod";
import { studentSchema } from "./student";

/** Optional UUID fields from <select> placeholders submit as "". */
const optionalUuid = z.union([z.string().uuid(), z.literal("")]).optional();

export const pickupPersonSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  relationship: z.string().min(1, "Relationship is required"),
  notes: z.string().optional(),
});

export const guardianOnboardingSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  whatsapp: z.string().optional(),
  relation: z.enum(["father", "mother", "guardian", "other"]).default("guardian"),
  address: z.string().optional(),
  workplace: z.string().optional(),
  /** Must be explicitly set — even guardians need pickup authorization recorded. */
  can_pickup: z.boolean().default(false),
});

export const studentOnboardingSchema = studentSchema.extend({
  home_address: z.string().optional(),
  notes: z.string().optional(),
  same_address_as_guardian: z.boolean().optional(),
  existing_guardian_id: optionalUuid,
  existing_guardian_can_pickup: z.boolean().default(false),
  primary_guardian: guardianOnboardingSchema.optional(),
  add_secondary_guardian: z.boolean().default(false),
  secondary_guardian: guardianOnboardingSchema.optional(),
  pickup_persons: z.array(pickupPersonSchema).default([]),
}).superRefine((data, ctx) => {
  const hasPrimary =
    Boolean(data.existing_guardian_id) ||
    Boolean(data.primary_guardian?.first_name?.trim() && data.primary_guardian?.last_name?.trim());
  if (!hasPrimary) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Primary guardian details are required",
      path: ["primary_guardian", "first_name"],
    });
  }
  if (
    data.add_secondary_guardian &&
    !(data.secondary_guardian?.first_name?.trim() && data.secondary_guardian?.last_name?.trim())
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Secondary guardian details are required",
      path: ["secondary_guardian", "first_name"],
    });
  }

  const primaryCanPickup = data.existing_guardian_id
    ? Boolean(data.existing_guardian_can_pickup)
    : Boolean(data.primary_guardian?.can_pickup);
  const secondaryCanPickup =
    Boolean(data.add_secondary_guardian) && Boolean(data.secondary_guardian?.can_pickup);
  const hasExtraPickup = (data.pickup_persons?.length ?? 0) > 0;

  if (!primaryCanPickup && !secondaryCanPickup && !hasExtraPickup) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Specify who may pick up this child from school — authorize a guardian and/or add another person",
      path: ["pickup_persons"],
    });
  }
});

export type PickupPersonData = z.infer<typeof pickupPersonSchema>;
export type GuardianOnboardingData = z.infer<typeof guardianOnboardingSchema>;
export type StudentOnboardingData = z.infer<typeof studentOnboardingSchema>;
