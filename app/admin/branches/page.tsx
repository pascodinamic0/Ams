import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getBranches, getSchools } from "@/lib/db";
import { BranchForm } from "./branch-form";

export default async function BranchesPage() {
  const [branches, schools] = await Promise.all([getBranches(), getSchools()]);
  const schoolsWithBranch = new Set(branches.map((b) => b.school_id));
  const schoolsWithoutBranch = schools
    .filter((s) => !schoolsWithBranch.has(s.id))
    .map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Branches</h1>
        <p className="mt-1 text-sm text-slate-500">
          Each school has one campus by default. Only add a branch here if a school
          was created without one (legacy data).
        </p>
      </div>
      <BranchForm schools={schoolsWithoutBranch} />
      {branches.length === 0 ? (
        <EmptyState title="No branches" description="Add branches for your schools" />
      ) : (
        <DataTable
          data={branches}
          columns={[
            { id: "name", header: "Name", accessorKey: "name", sortable: true },
            { id: "school", header: "School", accessorKey: "school_name" },
            { id: "address", header: "Address", accessorKey: "address" },
          ]}
        />
      )}
    </div>
  );
}
