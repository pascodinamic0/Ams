import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getClasses, getSections } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { ClassForm } from "./class-form";

export default async function ClassesPage() {
  const profile = await getCurrentProfile();
  const branchId = profile?.branch_id ?? "";
  const [classes, sections] = await Promise.all([
    branchId ? getClasses(branchId) : getClasses(),
    branchId ? getSections(branchId) : getSections(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Classes</h1>
      {branchId ? (
        <ClassForm branchId={branchId} sections={sections.map((s) => ({ id: s.id, name: s.name }))} />
      ) : (
        <p className="text-sm text-slate-500">Assign a branch to your profile to manage classes.</p>
      )}
      {classes.length === 0 ? (
        <EmptyState title="No classes yet" description="Create your first class above" />
      ) : (
        <DataTable
          data={classes}
          columns={[
            { id: "name", header: "Name", accessorKey: "name", sortable: true },
            { id: "grade", header: "Grade", accessorKey: "grade" },
            { id: "section", header: "Section", accessorKey: "section_name" },
            { id: "capacity", header: "Capacity", accessorKey: "capacity" },
          ]}
        />
      )}
    </div>
  );
}
