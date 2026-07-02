import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AddGuardianForm } from "@/components/forms/add-guardian-form";
import { getStudentById } from "@/lib/db/students";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function AddStudentGuardianPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studentId } = await params;
  const [student, profile] = await Promise.all([
    getStudentById(studentId),
    getCurrentProfile(),
  ]);

  if (!student) notFound();
  const schoolId = profile?.school_id ?? student.school_id;
  if (!schoolId) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-stone-500">
          {student.first_name} {student.last_name}
        </p>
        <h1 className="text-2xl font-bold">Add guardian</h1>
      </div>
      <AddGuardianForm studentId={studentId} schoolId={schoolId} />
      <Link href={`/academic/students/${studentId}`}>
        <Button variant="ghost">Back to student</Button>
      </Link>
    </div>
  );
}
