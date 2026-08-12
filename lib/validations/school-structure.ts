import { z } from "zod";
import {
  SCHOOL_LEVELS,
  SECTION_LETTERS,
} from "@/lib/schools/structure-presets";

export const schoolStructureSchema = z.object({
  school_level: z.enum(SCHOOL_LEVELS),
  grades: z
    .array(z.string().trim().min(1).max(80))
    .min(1, "selectAtLeastOneGrade")
    .max(40, "tooManyGrades"),
  sections: z
    .array(z.enum(SECTION_LETTERS))
    .min(1, "selectAtLeastOneSection")
    .max(26),
});

export type SchoolStructureInput = z.infer<typeof schoolStructureSchema>;
