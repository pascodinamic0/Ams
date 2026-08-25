import { z } from "zod";
import { SCHOOL_LEVELS } from "@/lib/schools/structure-presets";

export const schoolStructureSchema = z.object({
  school_levels: z
    .array(z.enum(SCHOOL_LEVELS))
    .min(1, "selectAtLeastOneLevel")
    .max(5, "tooManySchoolLevels"),
  grades: z
    .array(z.string().trim().min(1).max(80))
    .min(1, "selectAtLeastOneGrade")
    .max(40, "tooManyGrades"),
});

export type SchoolStructureInput = z.infer<typeof schoolStructureSchema>;
