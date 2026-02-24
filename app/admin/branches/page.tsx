import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";

export default async function BranchesPage() {
  const branches: { id: string; name: string; school_id: string }[] = [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Branches</h1>
      {branches.length === 0 ? (
        <EmptyState title="No branches" description="Add branches for your schools" />
      ) : (
        <DataTable
          data={branches}
          columns={[
            { id: "name", header: "Name", accessorKey: "name", sortable: true },
          ]}
          keyExtractor={(r) => (r as { id: string }).id}
        />
      )}
    </div>
  );
}
