import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getSubjects } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { SubjectForm } from "./subject-form";

export default async function SubjectsPage() {
  const profile = await getCurrentProfile();
  const branchId = profile?.branch_id ?? "";
  const subjects = branchId ? await getSubjects(branchId) : await getSubjects();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Subjects</h1>
      {branchId && <SubjectForm branchId={branchId} />}
      {subjects.length === 0 ? (
        <EmptyState title="No subjects yet" description="Add subjects for your curriculum" />
      ) : (
        <DataTable data={subjects} columns={[{ id: "name", header: "Name", accessorKey: "name", sortable: true }]} />
      )}
    </div>
  );
}
