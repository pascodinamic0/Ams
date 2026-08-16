import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { LessonNoteContent } from "@/components/lessons/lesson-note-content";
import type { StudentLessonMaterialItem } from "@/lib/db/lesson-materials";

interface Props {
  material: StudentLessonMaterialItem;
  showStudentName?: string;
}

export async function LessonMaterialCard({ material, showStudentName }: Props) {
  const t = await getTranslations("student");

  return (
    <article className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {showStudentName && (
            <p className="text-xs font-medium text-stone-500">{showStudentName}</p>
          )}
          <h2 className="font-semibold text-stone-900 dark:text-white">{material.title}</h2>
          <p className="mt-1 text-xs text-stone-500">
            {format(new Date(material.lesson_date), "MMM d, yyyy")}
            {material.subject_name ? ` - ${material.subject_name}` : ""}
            {material.class_name ? ` - ${material.class_name}` : ""}
          </p>
          {material.teacher_name && (
            <p className="text-xs text-stone-500">
              {t("lessonFromTeacher", { name: material.teacher_name })}
            </p>
          )}
        </div>
      </div>

      {material.note && (
        <LessonNoteContent
          note={material.note}
          className="prose prose-sm mt-3 max-w-none text-stone-600 dark:prose-invert dark:text-stone-400 [&_h2]:text-base [&_h3]:text-sm [&_ul]:list-disc [&_ol]:list-decimal"
        />
      )}

      {material.attachments.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-stone-500">{t("attachmentsLabel")}</p>
          <ul className="mt-2 space-y-2">
            {material.attachments.map((att) => (
              <li key={att.id}>
                {att.url ? (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm text-blue-600 hover:bg-stone-50 dark:border-stone-700 dark:text-blue-400 dark:hover:bg-stone-800"
                  >
                    {att.kind === "link" ? t("openLink") : t("downloadFile")}
                    {att.file_name ? `: ${att.file_name}` : ""}
                  </a>
                ) : (
                  <span className="text-sm text-stone-500">{att.file_name ?? "-"}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
