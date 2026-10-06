"use client";

import { useMemo, useState } from "react";
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
  const [classId, setClassId] = useState("");
  const visible = useMemo(
    () => (classId ? filterFeeStructuresForClass(structures, classId) : structures),
    [classId, structures]
  );

  return (
    <>
      <FeeStructureForm
        branchId={branchId}
        classes={classes}
        onClassChange={setClassId}
      />
      {structures.length === 0 ? (
        <EmptyState title={t("noFeeStructures")} description={t("noFeeStructuresDesc")} />
      ) : (
        <FeeStructureTable rows={visible} />
      )}
    </>
  );
}
