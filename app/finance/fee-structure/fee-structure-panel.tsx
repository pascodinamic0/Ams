"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state";
import type { FeeStructureListItem } from "@/lib/db/fee-structures";
import { filterFeeStructuresForClass } from "@/lib/services/enrollment-fees";
import { FeeStructureForm } from "./fee-structure-form";
import { FeeStructureTable } from "./fee-structure-table";

export function FeeStructurePanel({
  branchId,
  classes,
  structures,
}: {
  branchId: string;
  classes: { id: string; name: string }[];
  structures: FeeStructureListItem[];
}) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const formRef = useRef<HTMLDivElement>(null);
  const [classId, setClassId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = structures.find((structure) => structure.id === editingId) ?? null;
  const visible = useMemo(() => {
    const filtered = classId
      ? filterFeeStructuresForClass(structures, classId)
      : structures;
    if (!editing || filtered.some((row) => row.id === editing.id)) return filtered;
    return [editing, ...filtered];
  }, [classId, editing, structures]);

  useEffect(() => {
    if (!editingId) return;
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editingId]);

  return (
    <>
      <div ref={formRef} className="space-y-2">
        {editing ? (
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium">{t("editFeeStructure")}</h2>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              {tc("cancel")}
            </button>
          </div>
        ) : null}
        <FeeStructureForm
          branchId={branchId}
          classes={classes}
          structure={editing ?? undefined}
          onClassChange={editing ? undefined : setClassId}
          onSaved={() => setEditingId(null)}
        />
      </div>
      {structures.length === 0 ? (
        <EmptyState title={t("noFeeStructures")} description={t("noFeeStructuresDesc")} />
      ) : (
        <FeeStructureTable rows={visible} onEdit={setEditingId} />
      )}
    </>
  );
}
