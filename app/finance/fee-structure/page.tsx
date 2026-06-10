import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getFeeStructures, getClasses } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { FeeStructureForm } from "./fee-structure-form";
import { DeleteFeeStructureButton } from "./delete-button";

export default async function FeeStructurePage() {
  const profile = await getCurrentProfile();
  const branchId = profile?.branch_id ?? "";
  const structures = branchId
    ? await getFeeStructures(branchId)
    : await getFeeStructures();
  const classes = branchId ? await getClasses(branchId) : await getClasses();
  const tableData = structures.map((row) => ({
    ...row,
    actions: <DeleteFeeStructureButton id={row.id as string} />,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fee Structure</h1>
      {branchId ? (
        <FeeStructureForm branchId={branchId} classes={classes.map((c) => ({ id: c.id, name: c.name }))} />
      ) : (
        <p className="text-sm text-slate-500">Assign a branch to your profile to manage fee structures.</p>
      )}
      {structures.length === 0 ? (
        <EmptyState
          title="No fee structures yet"
          description="Define tuition and fee templates for your branch"
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "name", header: "Name", accessorKey: "name", sortable: true },
            { id: "amount", header: "Amount", accessorKey: "amount", sortable: true },
            { id: "class_name", header: "Class", accessorKey: "class_name" },
            { id: "description", header: "Description", accessorKey: "description" },
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
