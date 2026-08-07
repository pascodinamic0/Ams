import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GuardianEditForm } from "@/components/forms/guardian-edit-form";
import { getGuardianById } from "@/lib/db/guardians";
import { getStudentById } from "@/lib/db/students";
import { formatPersonName, splitPersonName } from "@/lib/utils";

export default async function StudentGuardianPage({
  params,
}: {
  params: Promise<{ id: string; guardianId: string }>;
}) {
  const { id: studentId, guardianId } = await params;

  const [student, guardian] = await Promise.all([
    getStudentById(studentId),
    getGuardianById(guardianId),
  ]);

  if (!student || !guardian) notFound();

  const isLinked = (student.guardian_students as Array<{ guardians: { id: string } | null }> | null)
    ?.some((g) => g.guardians?.id === guardianId);

  if (!isLinked) notFound();

  const nameParts =
    guardian.first_name || guardian.last_name
      ? {
          first_name: guardian.first_name ?? "",
          middle_name: guardian.middle_name ?? "",
          last_name: guardian.last_name ?? "",
        }
      : splitPersonName(guardian.name);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-stone-500">
          Guardian for {formatPersonName(student)}
        </p>
        <h1 className="text-2xl font-bold">{formatPersonName(guardian) || guardian.name}</h1>
      </div>
      <GuardianEditForm
        guardianId={guardianId}
        studentId={studentId}
        defaultValues={{
          first_name: nameParts.first_name,
          middle_name: nameParts.middle_name ?? "",
          last_name: nameParts.last_name,
          email: guardian.email,
          whatsapp: guardian.phone ?? "",
          relation: (guardian.relation as "father" | "mother" | "guardian" | "other") ?? "guardian",
          address: guardian.address ?? "",
          workplace: guardian.workplace ?? "",
        }}
      />
      <Link href={`/academic/students/${studentId}`}>
        <Button variant="ghost">Back to student</Button>
      </Link>
    </div>
  );
}
