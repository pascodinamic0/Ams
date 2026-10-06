"use client";

import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { formatSchoolYear } from "@/lib/academic/school-year";
import type { FeeStructureListItem } from "@/lib/db/fee-structures";
import { DeleteFeeStructureButton } from "./delete-button";

export function FeeStructureTable({ rows }: { rows: FeeStructureListItem[] }) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");

  const data = rows.map((row) => ({
    id: row.id,
    name: row.name,
    school_year_label: formatSchoolYear(row.school_year),
    amount: row.amount,
    class_name: row.class_name,
    description: row.description,
  }));

  return (
    <DataTable
      data={data}
      columns={[
        { id: "name", header: tc("name"), accessorKey: "name", sortable: true },
        {
          id: "school_year",
          header: t("colSchoolYear"),
          accessorKey: "school_year_label",
          sortable: true,
        },
        { id: "amount", header: tc("amount"), accessorKey: "amount", sortable: true },
        { id: "class_name", header: t("colClass"), accessorKey: "class_name" },
        { id: "description", header: tc("description"), accessorKey: "description" },
        {
          id: "actions",
          header: "",
          accessorKey: "id",
          cell: (row) => <DeleteFeeStructureButton id={row.id} />,
        },
      ]}
    />
  );
}
