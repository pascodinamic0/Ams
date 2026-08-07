import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { UserAvatar } from "@/components/layout/user-avatar";
import { getStudents } from "@/lib/db";
import { getTranslations } from "next-intl/server";

export default async function StudentsPage() {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const students = await getStudents();
  const tableData = students.map((row) => ({
    ...row,
    name_link: (
      <Link href={`/academic/students/${row.id}`} className="flex items-center gap-3 font-medium text-primary hover:underline">
        <UserAvatar name={row.name} avatarUrl={row.photo_url} size="sm" />
        <span>{String(row.name)}</span>
      </Link>
    ),
  }));

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
      {students.length === 0 ? (
        <EmptyState
          title={t("noStudentsYet")}
          description={t("noStudentsDesc")}
          action={
            <Link href="/academic/students/new">
              <Button>{t("onboardStudent")}</Button>
            </Link>
          }
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "student_id", header: t("studentId"), accessorKey: "student_id", sortable: true },
            { id: "name", header: tc("name"), accessorKey: "name_link", sortable: true },
            { id: "class_name", header: t("class"), accessorKey: "class_name" },
            { id: "guardian_name", header: t("guardian"), accessorKey: "guardian_name" },
            { id: "status", header: tc("status"), accessorKey: "status" },
          ]}
        />
      )}
    </div>
  );
}
