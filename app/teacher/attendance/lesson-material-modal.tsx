"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { sendLessonMaterial } from "@/lib/actions/lesson-materials";
import { isRichTextEmpty } from "@/lib/rich-text/sanitize";
import { LESSON_MATERIALS_BUCKET } from "@/lib/lesson-materials/constants";
import type { TeacherSubjectOption } from "@/lib/db/lesson-materials";
import type { AttendanceRecordItem } from "@/lib/db";
import type { LessonAttachmentInput } from "@/lib/validations/lesson-materials";
import { toast } from "@/lib/toast";

type UploadedFile = {
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number;
};

type LinkDraft = {
  id: string;
  url: string;
  label: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  lessonDate: string;
  schoolId: string | null;
  teacherId: string;
  subjects: TeacherSubjectOption[];
  records: AttendanceRecordItem[];
  absentStudentIds: string[];
  attendanceSaved: boolean;
}

export function LessonMaterialModal({
  isOpen,
  onClose,
  classId,
  lessonDate,
  schoolId,
  teacherId,
  subjects,
  records,
  absentStudentIds,
  attendanceSaved,
}: Props) {
  const t = useTranslations("teacher");
  const tc = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [selectedStudents, setSelectedStudents] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(records.map((r) => [r.student_id, absentStudentIds.includes(r.student_id)]))
  );
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [links, setLinks] = useState<LinkDraft[]>([]);
  const [uploading, setUploading] = useState(false);

  const recipientIds = useMemo(
    () => Object.entries(selectedStudents).filter(([, checked]) => checked).map(([id]) => id),
    [selectedStudents]
  );

  const canSend =
    attendanceSaved &&
    recipientIds.length > 0 &&
    title.trim().length > 0 &&
    (!isRichTextEmpty(note) || uploadedFiles.length > 0 || links.some((l) => l.url.trim()));

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !schoolId) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(tc("fileTooLarge", { max: 50 }));
      return;
    }

    setUploading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${schoolId}/${teacherId}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from(LESSON_MATERIALS_BUCKET)
        .upload(storagePath, file);
      if (error) throw error;

      setUploadedFiles((prev) => [
        ...prev,
        {
          storage_path: storagePath,
          file_name: file.name,
          mime_type: file.type || null,
          size_bytes: file.size,
        },
      ]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc("uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  function addLinkRow() {
    setLinks((prev) => [...prev, { id: crypto.randomUUID(), url: "", label: "" }]);
  }

  function updateLink(id: string, patch: Partial<LinkDraft>) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function removeLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  function toggleStudent(studentId: string) {
    setSelectedStudents((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  }

  function handleClose() {
    if (pending || uploading) return;
    onClose();
  }

  function handleSend() {
    if (!canSend) return;

    const attachments: LessonAttachmentInput[] = [
      ...uploadedFiles.map((f) => ({
        kind: "file" as const,
        storage_path: f.storage_path,
        file_name: f.file_name,
        mime_type: f.mime_type,
        size_bytes: f.size_bytes,
      })),
      ...links
        .filter((l) => l.url.trim())
        .map((l) => ({
          kind: "link" as const,
          url: l.url.trim(),
          file_name: l.label.trim() || l.url.trim(),
        })),
    ];

    startTransition(async () => {
      const result = await sendLessonMaterial({
        class_id: classId,
        subject_id: subjectId || null,
        lesson_date: lessonDate,
        title: title.trim(),
        note: note.trim() || null,
        student_ids: recipientIds,
        attachments,
      });

      if ("error" in result && result.error) {
        const err = result.error;
        toast.error(typeof err === "string" ? err : t("sendLessonMaterialFailed"));
        return;
      }

      toast.success(t("lessonMaterialSent"));
      setTitle("");
      setNote("");
      setUploadedFiles([]);
      setLinks([]);
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("sendTodaysLessonModalTitle")} size="lg">
      <div className="space-y-4">
        <p className="text-sm text-stone-600 dark:text-stone-400">
          {t("sendTodaysLessonModalDesc")}
        </p>

        {!attendanceSaved && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            {t("saveAttendanceBeforeLesson")}
          </p>
        )}

        {subjects.length > 0 && (
          <div>
            <Label htmlFor="lesson-subject">{t("subjectLabel")}</Label>
            <select
              id="lesson-subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <Label htmlFor="lesson-title" required>{t("lessonTitleLabel")}</Label>
          <Input
            id="lesson-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("lessonTitlePlaceholder")}
          />
        </div>

        <div>
          <Label htmlFor="lesson-note">{t("lessonNoteLabel")}</Label>
          <p className="mb-2 text-xs text-stone-500">{t("lessonNoteRichHint")}</p>
          <RichTextEditor
            id="lesson-note"
            value={note}
            onChange={setNote}
            placeholder={t("lessonNotePlaceholder")}
            minHeight={260}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("lessonAttachmentsLabel")}</Label>
          <p className="text-xs text-stone-500">{t("fileUploadHint")}</p>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,image/*,video/mp4,video/webm,video/quicktime"
                onChange={handleFileUpload}
                disabled={uploading || !schoolId}
              />
              {uploading ? t("uploadingFile") : t("addFile")}
            </label>
            <Button type="button" size="sm" variant="outline" onClick={addLinkRow}>
              {t("addLink")}
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <ul className="space-y-1 text-sm">
              {uploadedFiles.map((f) => (
                <li key={f.storage_path} className="flex items-center justify-between rounded border px-2 py-1 dark:border-stone-700">
                  <span className="truncate">{f.file_name}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setUploadedFiles((prev) => prev.filter((x) => x.storage_path !== f.storage_path))}
                  >
                    {t("removeAttachment")}
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {links.map((link) => (
            <div key={link.id} className="grid gap-2 rounded border p-2 dark:border-stone-700 sm:grid-cols-2">
              <div>
                <Label htmlFor={`link-url-${link.id}`}>{t("linkUrlLabel")}</Label>
                <Input
                  id={`link-url-${link.id}`}
                  value={link.url}
                  onChange={(e) => updateLink(link.id, { url: e.target.value })}
                  placeholder={t("linkUrlPlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor={`link-label-${link.id}`}>{t("linkNameLabel")}</Label>
                <Input
                  id={`link-label-${link.id}`}
                  value={link.label}
                  onChange={(e) => updateLink(link.id, { label: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="button" size="sm" variant="ghost" onClick={() => removeLink(link.id)}>
                  {t("removeAttachment")}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label>{t("recipientsLabel")}</Label>
          <p className="text-xs text-stone-500">{t("recipientsHint")}</p>
          <ul className="max-h-40 space-y-1 overflow-y-auto rounded border p-2 dark:border-stone-700">
            {records.map((r) => (
              <li key={r.student_id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedStudents[r.student_id] ?? false}
                    onChange={() => toggleStudent(r.student_id)}
                  />
                  <span>{r.student_name}</span>
                  <span className="text-stone-500">{r.student_number ?? tc("emptyDash")}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={pending || uploading}>
            {tc("cancel")}
          </Button>
          <Button type="button" onClick={handleSend} disabled={!canSend || pending || uploading}>
            {t("sendLessonMaterial")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
