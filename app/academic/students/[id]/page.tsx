import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentById } from "@/lib/db/students";
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
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();

  const guardians = (student.guardian_students as GuardianLink[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{student.first_name} {student.last_name}</h1>
          <p className="text-sm text-slate-500">ID: {student.student_id}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/academic/students"><Button variant="ghost">Back</Button></Link>
          <DeleteStudentButton id={id} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-slate-500">Status:</span> {student.status}</p>
            <p><span className="text-slate-500">DOB:</span> {student.date_of_birth}</p>
            {student.gender && (
              <p><span className="text-slate-500">Gender:</span> {student.gender}</p>
            )}
            <p><span className="text-slate-500">Class:</span> {(student.classes as { name?: string } | null)?.name ?? "—"}</p>
            {student.home_address && (
              <p><span className="text-slate-500">Home address:</span> {student.home_address}</p>
            )}
            {student.notes && (
              <div>
                <p className="text-slate-500">Notes:</p>
                <p className="mt-1 whitespace-pre-wrap">{student.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Guardians</CardTitle>
            <Link href={`/academic/students/${id}/guardians/new`}>
              <Button size="sm" variant="outline">Add guardian</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {guardians.length === 0 ? (
              <p className="text-sm text-slate-500">No guardians linked</p>
            ) : (
              guardians.map((g) => {
                const guardian = g.guardians;
                if (!guardian) return null;
                return (
                  <Link
                    key={guardian.id}
                    href={`/academic/students/${id}/guardians/${guardian.id}`}
                    className="block rounded-lg border border-slate-200 p-3 transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                  >
                    <p className="font-medium text-indigo-600 dark:text-indigo-400">{guardian.name}</p>
                    <p className="text-sm text-slate-500">
                      {guardian.email}
                      {guardian.phone ? ` · ${guardian.phone}` : ""}
                    </p>
                    <p className="text-xs capitalize text-slate-400">{guardian.relation}</p>
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
