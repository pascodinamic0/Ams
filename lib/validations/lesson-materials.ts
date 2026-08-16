import { z } from "zod";
import { isRichTextEmpty } from "@/lib/rich-text/sanitize";

export const lessonAttachmentInputSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("file"),
    storage_path: z.string().min(1),
    file_name: z.string().min(1),
    mime_type: z.string().optional().nullable(),
    size_bytes: z.coerce.number().int().nonnegative().optional().nullable(),
  }),
  z.object({
    kind: z.literal("link"),
    url: z.string().url(),
    file_name: z.string().optional().nullable(),
  }),
]);

export const sendLessonMaterialSchema = z.object({
  class_id: z.string().uuid(),
  subject_id: z.string().uuid().optional().nullable(),
  lesson_date: z.string().min(1),
  title: z.string().min(1, "titleRequired"),
  note: z.string().optional().nullable(),
  student_ids: z.array(z.string().uuid()).min(1),
  attachments: z.array(lessonAttachmentInputSchema).default([]),
}).refine(
  (data) =>
    data.attachments.length > 0 ||
    (data.note != null && !isRichTextEmpty(data.note)),
  { message: "materialContentRequired", path: ["attachments"] }
);

export type LessonAttachmentInput = z.infer<typeof lessonAttachmentInputSchema>;
export type SendLessonMaterialInput = z.infer<typeof sendLessonMaterialSchema>;
