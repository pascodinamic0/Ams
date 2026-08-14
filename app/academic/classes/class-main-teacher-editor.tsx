"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { updateClass } from "@/lib/actions/classes";
import { toast } from "@/lib/toast";

export function ClassMainTeacherEditor({
  id,
  mainTeacherId,
  teachers,
}: {
  id: string;
  mainTeacherId: string | null;
  teachers: { id: string; name: string }[];
}) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [value, setValue] = useState(mainTeacherId ?? "");
  const [loading, setLoading] = useState(false);
  const savingRef = useRef(false);

  const dirty = value !== (mainTeacherId ?? "");

  async function save() {
    if (!dirty || savingRef.current) return;

    savingRef.current = true;
    setLoading(true);
    const result = await updateClass(id, {
      main_teacher_id: value.trim() === "" ? null : value,
    });
    setLoading(false);
    savingRef.current = false;

    if ("error" in result && result.error) {
      toast.error(
        typeof result.error === "string" ? result.error : t("classUpdateFailed")
      );
      return;
    }
    toast.success(t("classUpdated"));
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        className="min-w-[160px]"
        disabled={loading}
        aria-label={t("mainTeacher")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => void save()}
        options={[
          { value: "", label: t("noTeacherAssigned") },
          ...teachers.map((teacher) => ({ value: teacher.id, label: teacher.name })),
        ]}
      />
      {dirty ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={() => void save()}
          aria-label={tc("save")}
        >
          <Check className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
