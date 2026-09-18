import { z } from "zod";
import { studentSchema } from "./student";

/** Optional UUID fields from <select> placeholders submit as "". */
const optionalUuid = z.union([z.string().uuid(), z.literal("")]).optional();

const optionalText = z.string().optional().or(z.literal(""));

/** Blank email is allowed; a typed value must be a real address. */
const optionalEmail = z.preprocess(
  (val) => (val === "" || val == null ? undefined : val),
  z.string().email("guardianEmailInvalid").optional()
);

export const pickupPersonSchema = z.object({
  full_name: z.string().min(1, "nameRequired"),
  phone: z.string().min(1, "phoneRequired"),
  relationship: z.string().min(1, "relationshipRequired"),
  notes: z.string().optional(),
});

export const guardianOnboardingSchema = z.object({
  first_name: optionalText,
  middle_name: optionalText,
  last_name: optionalText,
  email: optionalEmail,
  whatsapp: optionalText,
  relation: z.enum(["father", "mother", "guardian", "other"]).default("guardian"),
  address: optionalText,
  workplace: optionalText,
  can_pickup: z.boolean().default(false),
});

export type GuardianOnboardingInput = z.input<typeof guardianOnboardingSchema>;
export type GuardianOnboardingData = z.output<typeof guardianOnboardingSchema>;

function textStarted(...values: Array<string | undefined | null>) {
  return values.some((value) => Boolean(value?.trim()));
}

export function guardianContactStarted(
  guardian?: GuardianOnboardingInput | GuardianOnboardingData | null
) {
  if (!guardian) return false;
  return textStarted(
    guardian.first_name,
    guardian.middle_name,
    guardian.last_name,
    typeof guardian.email === "string" ? guardian.email : undefined,
    guardian.whatsapp,
    guardian.address,
    guardian.workplace
  );
}

export function isSavableGuardian(
  guardian?: GuardianOnboardingInput | GuardianOnboardingData | null
) {
  return Boolean(guardian?.first_name?.trim() && guardian?.last_name?.trim());
}

function requireGuardianNames(
  guardian: GuardianOnboardingInput | GuardianOnboardingData | undefined,
  path: "primary_guardian" | "secondary_guardian",
  ctx: z.RefinementCtx
) {
  if (!guardian?.first_name?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: path === "secondary_guardian" ? "secondaryGuardianFirstNameToSave" : "guardianFirstNameToSave",
      path: [path, "first_name"],
    });
  }
  if (!guardian?.last_name?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: path === "secondary_guardian" ? "secondaryGuardianLastNameToSave" : "guardianLastNameToSave",
      path: [path, "last_name"],
    });
  }
}

/** Used when staff is explicitly adding a guardian after enrollment. */
export const guardianAddSchema = guardianOnboardingSchema.superRefine((data, ctx) => {
  if (!data.first_name?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "firstNameRequired",
      path: ["first_name"],
    });
  }
  if (!data.last_name?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "lastNameRequired",
      path: ["last_name"],
    });
  }
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
  pickup_persons: z.preprocess(
    (val) =>
      Array.isArray(val)
        ? val.filter((person) => {
            if (!person || typeof person !== "object") return false;
            const row = person as {
              full_name?: string;
              phone?: string;
              relationship?: string;
              notes?: string;
            };
            return Boolean(
              row.full_name?.trim() ||
                row.phone?.trim() ||
                row.relationship?.trim() ||
                row.notes?.trim()
            );
          })
        : val,
    z.array(pickupPersonSchema).default([])
  ),
  /** Required enrollment fee package — finance verifies payment against this invoice. */
  fee_structure_id: z.string().uuid("feeStructureRequired"),
  /** Paper receipt number from the manual facture book (optional until parent pays). */
  enrollment_receipt_ref: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.existing_guardian_id && guardianContactStarted(data.primary_guardian)) {
    requireGuardianNames(data.primary_guardian, "primary_guardian", ctx);
  }

  if (data.add_secondary_guardian && guardianContactStarted(data.secondary_guardian)) {
    requireGuardianNames(data.secondary_guardian, "secondary_guardian", ctx);
  }
});

export type PickupPersonData = z.infer<typeof pickupPersonSchema>;
export type StudentOnboardingData = z.infer<typeof studentOnboardingSchema>;
