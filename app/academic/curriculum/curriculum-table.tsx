"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import type { CurriculumListItem } from "@/lib/db/curriculum";
import { CurriculumActions } from "./curriculum-actions";

type SubjectOption = { id: string; name: string };

type CurriculumRow = CurriculumListItem & {
  syllabus_display: string;
  actions: React.ReactNode;
};

export function CurriculumTable({
  curriculum,
  branchId,
  subjects,
}: {
  curriculum: CurriculumListItem[];
  branchId: string;
  subjects: SubjectOption[];
}) {
  const t = useTranslations("academic");

  const columns: ColumnDef<CurriculumRow>[] = useMemo(
    () => [
      { id: "grade", header: t("grade"), accessorKey: "grade", sortable: true },
      { id: "subject_name", header: t("subject"), accessorKey: "subject_name", sortable: true },
      { id: "syllabus", header: t("syllabus"), accessorKey: "syllabus_display" },
      { id: "actions", header: "", accessorKey: "actions" },
    ],
    [t]
  );

  const tableData: CurriculumRow[] = curriculum.map((row) => ({
    ...row,
    syllabus_display: row.syllabus || "\u2014",
    actions: (
      <CurriculumActions item={row} branchId={branchId} subjects={subjects} />
    ),
  }));

  return <DataTable data={tableData} columns={columns} />;
}
