import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentById } from "@/lib/db/students";
import { getTranslations } from "next-intl/server";
import { DeleteStudentButton } from "./delete-button";

type GuardianLink = {
  guardians: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    relation: string;
    address?: string | null;
    workplace?: string | null;
  } | null;
};

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();

  const guardians = (student.guardian_students as GuardianLink[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{student.first_name} {student.last_name}</h1>
          <p className="text-sm text-stone-500">{t("studentId")}: {student.student_id}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/academic/students"><Button variant="ghost">{tc("back")}</Button></Link>
          <DeleteStudentButton id={id} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t("details")}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-stone-500">{tc("status")}:</span> {student.status}</p>
            <p><span className="text-stone-500">{t("dob")}:</span> {student.date_of_birth}</p>
            {student.gender && (
              <p><span className="text-stone-500">{t("gender")}:</span> {student.gender}</p>
            )}
            <p><span className="text-stone-500">{t("class")}:</span> {(student.classes as { name?: string } | null)?.name ?? "—"}</p>
            {student.home_address && (
              <p><span className="text-stone-500">{t("homeAddress")}:</span> {student.home_address}</p>
            )}
            {student.notes && (
              <div>
                <p className="text-stone-500">{tc("notes")}:</p>
                <p className="mt-1 whitespace-pre-wrap">{student.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{t("guardians")}</CardTitle>
            <Link href={`/academic/students/${id}/guardians/new`}>
              <Button size="sm" variant="outline">{t("addGuardian")}</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {guardians.length === 0 ? (
              <p className="text-sm text-stone-500">{t("noGuardiansLinked")}</p>
            ) : (
              guardians.map((g) => {
                const guardian = g.guardians;
                if (!guardian) return null;
                return (
                  <Link
                    key={guardian.id}
                    href={`/academic/students/${id}/guardians/${guardian.id}`}
                    className="block rounded-lg border border-stone-200 p-3 transition hover:border-primary-300 hover:bg-primary-light/50 dark:border-stone-700 dark:hover:border-primary-700 dark:hover:bg-primary-light/30"
                  >
                    <p className="font-medium text-primary dark:text-primary">{guardian.name}</p>
                    <p className="text-sm text-stone-500">
                      {guardian.email}
                      {guardian.phone ? ` · ${guardian.phone}` : ""}
                    </p>
                    <p className="text-xs capitalize text-stone-400">{guardian.relation}</p>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
