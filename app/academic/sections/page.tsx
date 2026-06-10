import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getSections } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { SectionForm } from "./section-form";

export default async function SectionsPage() {
  const profile = await getCurrentProfile();
  const branchId = profile?.branch_id ?? "";
  const sections = branchId ? await getSections(branchId) : await getSections();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sections</h1>
      {branchId && <SectionForm branchId={branchId} />}
      {sections.length === 0 ? (
        <EmptyState title="No sections yet" description="Create a section to organize classes" />
      ) : (
        <DataTable data={sections} columns={[{ id: "name", header: "Name", accessorKey: "name", sortable: true }]} />
      )}
    </div>
  );
}
