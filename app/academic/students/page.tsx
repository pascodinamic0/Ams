import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { UserAvatar } from "@/components/layout/user-avatar";
import { StudentListFilters } from "@/components/students/student-list-filters";
import { getStudents } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { canDeleteStudents } from "@/lib/auth/rbac";
import { getTranslations } from "next-intl/server";
import { DeleteStudentButton } from "./delete-button";
import { StudentStatusBadge } from "@/components/students/student-status-badge";
import { formatStudentStatusLabel } from "@/lib/students/status";
import { isStudentTag } from "@/lib/students/tags";
import { STUDENT_STATUSES } from "@/lib/validations/student";

function tagLabel(
  tag: string,
  t: Awaited<ReturnType<typeof getTranslations<"academic">>>
) {
  if (tag === "follow_up") return t("tagFollowUp");
  if (tag === "incomplete_docs") return t("tagIncompleteDocs");
  if (tag === "fee_hold") return t("tagFeeHold");
  return tag;
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tag?: string }>;
}) {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  const canDelete = canDeleteStudents(profile?.role);
  const params = await searchParams;
  const statusFilter =
    params.status &&
    (STUDENT_STATUSES as readonly string[]).includes(params.status)
      ? params.status
      : undefined;
  const tagFilter =
    params.tag && isStudentTag(params.tag) ? params.tag : undefined;

  const students = await getStudents({
    status: statusFilter,
    tag: tagFilter,
  });

  const statusCopy = {
    active: tc("active"),
    pending: tc("pending"),
    inactive: tc("inactive"),
    graduated: t("statusGraduated"),
  };

  const tableData = students.map((row) => ({
    ...row,
    name_link: (
      <Link
        href={`/academic/students/${row.id}`}
        className={`flex items-center gap-3 font-medium hover:underline ${
          row.status === "active"
            ? "text-primary"
            : "text-stone-500 dark:text-stone-400"
        }`}
      >
        <UserAvatar name={row.name} avatarUrl={row.photo_url} size="sm" />
        <span>{String(row.name)}</span>
      </Link>
    ),
    status_display: (
      <div className="flex flex-wrap items-center gap-1.5">
        <StudentStatusBadge
          status={row.status}
          label={formatStudentStatusLabel(row.status, statusCopy)}
        />
        {row.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
          >
            {tagLabel(tag, t)}
          </span>
        ))}
      </div>
    ),
    actions: canDelete ? (
      <DeleteStudentButton id={row.id} name={row.name} compact />
    ) : null,
  }));

  const hasFilters = Boolean(statusFilter || tagFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("studentsTitle")}</h1>
        <div className="flex gap-2">
          <Link href="/academic/students/import">
            <Button variant="outline">{t("importCsv")}</Button>
          </Link>
          <Link href="/academic/students/new">
            <Button>{t("onboardStudent")}</Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={null}>
        <StudentListFilters
          initialStatus={statusFilter ?? ""}
          initialTag={tagFilter ?? ""}
        />
      </Suspense>

      {students.length === 0 ? (
        <EmptyState
          title={hasFilters ? t("noStudentsMatchFilters") : t("noStudentsYet")}
          description={
            hasFilters ? t("noStudentsMatchFiltersDesc") : t("noStudentsDesc")
          }
          action={
            hasFilters ? undefined : (
              <Link href="/academic/students/new">
                <Button>{t("onboardStudent")}</Button>
              </Link>
            )
          }
        />
      ) : (
        <DataTable
          data={tableData}
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
              accessorKey: "name_link",
              sortable: true,
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
              accessorKey: "status_display",
            },
            ...(canDelete
              ? [{ id: "actions", header: "", accessorKey: "actions" as const }]
              : []),
          ]}
        />
      )}
    </div>
  );
}
