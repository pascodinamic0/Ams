import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportButton } from "@/components/ui/export-button";
import { Input } from "@/components/ui/input";
import { getCurrentProfile } from "@/lib/auth/session";
import { getStudents } from "@/lib/db";
import { getTranslations } from "next-intl/server";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const { q } = await searchParams;
  const search = q?.trim() || undefined;
  const profile = await getCurrentProfile();

  const students = await getStudents({
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
    search,
  });

  const tableData = students.map((row) => ({
    ...row,
    name_link: (
      <Link href={`/academic/students/${row.id}`} className="font-medium text-primary hover:underline">
        {String(row.name)}
      </Link>
    ),
  }));

  const exportRows = students.map((row) => ({
    student_id: row.student_id ?? "",
    name: row.name,
    class_name: row.class_name ?? "",
    guardian_name: row.guardian_name ?? "",
    status: row.status ?? "",
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("studentsTitle")}</h1>
        <div className="flex flex-wrap gap-2">
          {exportRows.length > 0 ? (
            <ExportButton
              data={exportRows}
              filename="students.csv"
              label={t("exportCsv")}
              columns={[
                { key: "student_id", label: t("studentId") },
                { key: "name", label: tc("name") },
                { key: "class_name", label: t("class") },
                { key: "guardian_name", label: t("guardian") },
                { key: "status", label: tc("status") },
              ]}
            />
          ) : null}
          <Link href="/academic/students/import">
            <Button variant="outline">{t("importCsv")}</Button>
          </Link>
          <Link href="/academic/students/new">
            <Button>{t("onboardStudent")}</Button>
          </Link>
        </div>
      </div>

      <form className="flex max-w-md gap-2">
        <Input
          name="q"
          defaultValue={search ?? ""}
          placeholder={t("searchStudents")}
          aria-label={t("searchStudents")}
        />
        <Button type="submit" variant="outline">
          {tc("search")}
        </Button>
      </form>

      {students.length === 0 ? (
        <EmptyState
          title={search ? t("noStudentsMatch") : t("noStudentsYet")}
          description={search ? t("noStudentsMatchDesc") : t("noStudentsDesc")}
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
