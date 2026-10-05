"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { UserAvatar } from "@/components/layout/user-avatar";
import { StudentStatusBadge } from "@/components/students/student-status-badge";
import { DataTable } from "@/components/ui/data-table";
import { DeleteStudentButton } from "@/app/academic/students/delete-button";
import { formatStudentStatusLabel } from "@/lib/students/status";
import { isStudentTag } from "@/lib/students/tags";
import type { StudentListItem } from "@/lib/db/students";

export function StudentsTable({
  students,
  canDelete,
}: {
  students: StudentListItem[];
  canDelete: boolean;
}) {
  const t = useTranslations("academic");
  const tc = useTranslations("common");
  const statusCopy = {
    active: tc("active"),
    pending: tc("pending"),
    inactive: tc("inactive"),
    graduated: t("statusGraduated"),
  };

  function tagLabel(tag: string) {
    if (tag === "follow_up") return t("tagFollowUp");
    if (tag === "incomplete_docs") return t("tagIncompleteDocs");
    if (tag === "fee_hold") return t("tagFeeHold");
    return tag;
  }

  return (
    <DataTable
      numbered
      data={students}
      columns={[
        {
          id: "student_id",
          header: t("studentId"),
          accessorKey: "student_id",
          sortable: true,
        },
        {
          id: "name",
          header: tc("name"),
          accessorKey: "name",
          sortable: true,
          cell: (row) => (
            <Link
              href={`/academic/students/${row.id}`}
              className={`flex items-center gap-3 font-medium hover:underline ${
                row.status === "active"
                  ? "text-primary"
                  : "text-stone-700 dark:text-stone-200"
              }`}
            >
              <UserAvatar name={row.name} avatarUrl={row.photo_url} size="sm" />
              <span>{row.name}</span>
            </Link>
          ),
        },
        { id: "class_name", header: t("class"), accessorKey: "class_name" },
        {
          id: "guardian_name",
          header: t("guardian"),
          accessorKey: "guardian_name",
        },
        {
          id: "status",
          header: tc("status"),
          accessorKey: "status",
          cell: (row) => (
            <div className="flex flex-wrap items-center gap-1.5">
              <StudentStatusBadge
                status={row.status}
                label={formatStudentStatusLabel(row.status, statusCopy)}
              />
              {row.tags.filter(isStudentTag).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
                >
                  {tagLabel(tag)}
                </span>
              ))}
            </div>
          ),
        },
        ...(canDelete
          ? [
              {
                id: "actions",
                header: "",
                accessorKey: "id" as const,
                cell: (row: StudentListItem) => (
                  <DeleteStudentButton id={row.id} name={row.name} compact />
                ),
              },
            ]
          : []),
      ]}
    />
  );
}
