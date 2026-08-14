"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { assignStudentClass } from "@/lib/actions/students";
import { formatClassOptionLabel, isClassFull } from "@/lib/utils/class-options";
import type { ClassListItem } from "@/lib/db/classes";
import { toast } from "@/lib/toast";

export function StudentClassAssign({
  studentId,
  currentClassId,
  currentClassName,
  classes,
  canOverrideCapacity = false,
}: {
  studentId: string;
  currentClassId: string | null;
  currentClassName: string | null;
  classes: ClassListItem[];
  canOverrideCapacity?: boolean;
}) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const router = useRouter();
  const [classId, setClassId] = useState(currentClassId ?? "");
  const [overrideCapacity, setOverrideCapacity] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedClass = classes.find((c) => c.id === classId);
  const classIsFull = selectedClass ? isClassFull(selectedClass) : false;
  const dirty = classId !== (currentClassId ?? "");

  async function save() {
    if (!classId) {
      toast.error(t("selectClassRequired"));
      return;
    }
    if (classIsFull && !canOverrideCapacity) {
      toast.error(t("classFullNoOverride"));
      return;
    }
    if (classIsFull && canOverrideCapacity && !overrideCapacity) {
      toast.error(t("enrollAnywayFullClassHint"));
      return;
    }

    setLoading(true);
    const result = await assignStudentClass(studentId, classId, {
      overrideCapacity: overrideCapacity && canOverrideCapacity,
    });
    setLoading(false);

    if ("error" in result && result.error) {
      const message =
        typeof result.error === "string"
          ? result.error
          : Object.values(result.error as Record<string, string[]>)
              .flat()
              .filter(Boolean)[0] ?? t("classUpdateFailed");
      toast.error(message);
      return;
    }

    toast.success(t("classAssigned"));
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-lg border border-stone-200 p-4 dark:border-stone-800">
      <div>
        <p className="text-sm font-medium text-stone-900 dark:text-white">
          {currentClassId ? t("changeClass") : t("assignClass")}
        </p>
        {currentClassName ? (
          <p className="mt-0.5 text-xs text-stone-500">
            {t("currentClass")}: {currentClassName}
          </p>
        ) : null}
      </div>
      <Select
        aria-label={t("selectClass")}
        placeholder={t("selectClassRequired")}
        value={classId}
        onChange={(e) => setClassId(e.target.value)}
        options={classes.map((c) => ({
          value: c.id,
          label: formatClassOptionLabel(c),
        }))}
      />
      {classIsFull && !canOverrideCapacity ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">{t("classFullNoOverride")}</p>
      ) : null}
      {classIsFull && canOverrideCapacity ? (
        <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
          <input
            type="checkbox"
            className="rounded border-stone-300"
            checked={overrideCapacity}
            onChange={(e) => setOverrideCapacity(e.target.checked)}
          />
          {t("enrollAnywayFullClass")}
        </label>
      ) : null}
      <Button type="button" size="sm" disabled={loading || !dirty || !classId} onClick={save}>
        {loading ? tc("saving") : tc("save")}
      </Button>
    </div>
  );
}
