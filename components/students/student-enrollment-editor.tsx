"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { updateStudentEnrollmentMeta } from "@/lib/actions/students";
import { STUDENT_TAGS, type StudentTag } from "@/lib/students/tags";
import { formatStudentStatusLabel } from "@/lib/students/status";
import { STUDENT_STATUSES, type StudentStatus } from "@/lib/validations/student";
import { toast } from "@/lib/toast";

function sameTags(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((t) => set.has(t));
}

export function StudentEnrollmentEditor({
  studentId,
  currentStatus,
  currentTags,
}: {
  studentId: string;
  currentStatus: string;
  currentTags: string[];
}) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const initialStatus = (STUDENT_STATUSES as readonly string[]).includes(
    currentStatus
  )
    ? (currentStatus as StudentStatus)
    : "active";
  const [status, setStatus] = useState<StudentStatus>(initialStatus);
  const [tags, setTags] = useState<StudentTag[]>(
    STUDENT_TAGS.filter((tag) => currentTags.includes(tag))
  );
  const [loading, setLoading] = useState(false);

  const dirty =
    status !== initialStatus || !sameTags(tags, currentTags);

  function toggleTag(tag: StudentTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function tagLabel(tag: StudentTag) {
    if (tag === "follow_up") return t("tagFollowUp");
    if (tag === "incomplete_docs") return t("tagIncompleteDocs");
    return t("tagFeeHold");
  }

  function statusLabel(value: StudentStatus) {
    return formatStudentStatusLabel(value, {
      active: tc("active"),
      pending: tc("pending"),
      inactive: tc("inactive"),
      graduated: t("statusGraduated"),
    });
  }

  async function save() {
    setLoading(true);
    const result = await updateStudentEnrollmentMeta(studentId, {
      status,
      tags,
    });
    setLoading(false);

    if ("error" in result && result.error) {
      const message =
        typeof result.error === "string"
          ? result.error
          : Object.values(result.error as Record<string, string[]>)
              .flat()
              .filter(Boolean)[0] ?? t("enrollmentUpdateFailed");
      toast.error(message);
      return;
    }

    toast.success(t("enrollmentUpdated"));
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-lg border border-stone-200 p-4 dark:border-stone-800">
      <div>
        <p className="text-sm font-medium text-stone-900 dark:text-white">
          {t("enrollmentStatus")}
        </p>
        <p className="mt-0.5 text-xs text-stone-500">{t("enrollmentStatusDesc")}</p>
      </div>

      <div>
        <label htmlFor="enrollment-status" className="text-xs font-medium text-stone-500">
          {tc("status")}
        </label>
        <Select
          id="enrollment-status"
          className="mt-1"
          value={status}
          onChange={(e) => setStatus(e.target.value as StudentStatus)}
          options={STUDENT_STATUSES.map((value) => ({
            value,
            label: statusLabel(value),
          }))}
        />
      </div>

      <div>
        <p className="text-xs font-medium text-stone-500">{t("enrollmentTags")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STUDENT_TAGS.map((tag) => {
            const checked = tags.includes(tag);
            return (
              <label
                key={tag}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                  checked
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-stone-200 text-stone-600 dark:border-stone-700 dark:text-stone-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="rounded border-stone-300"
                  checked={checked}
                  onChange={() => toggleTag(tag)}
                />
                {tagLabel(tag)}
              </label>
            );
          })}
        </div>
      </div>

      <Button type="button" size="sm" disabled={loading || !dirty} onClick={save}>
        {loading ? tc("saving") : tc("save")}
      </Button>
    </div>
  );
}
