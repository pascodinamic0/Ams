import { sanitizeLessonHtml, wrapPlainTextAsHtml } from "@/lib/rich-text/sanitize";

interface Props {
  note: string;
  className?: string;
}

export function LessonNoteContent({ note, className }: Props) {
  const html = note.includes("<") ? sanitizeLessonHtml(note) : wrapPlainTextAsHtml(note);
  if (!html) return null;

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
