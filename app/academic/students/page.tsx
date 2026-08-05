import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentProfile } from "@/lib/auth/session";
import { getStudents } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { StudentsTable } from "./students-table";

export default async function StudentsPage() {
  const t = await getTranslations("academic");
  const profile = await getCurrentProfile();
  const schoolId =
    profile?.role === "super_admin" ? undefined : profile?.school_id ?? undefined;

  const students = schoolId
    ? await getStudents({ schoolId })
    : profile?.role === "super_admin"
      ? await getStudents()
      : [];

  const tableData = students.map((row) => ({
    id: row.id,
    student_id: row.student_id,
    name: row.name,
    class_name: row.class_name,
    guardian_name: row.guardian_name,
    status: row.status,
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
        <StudentsTable students={tableData} />
      )}
    </div>
  );
}
