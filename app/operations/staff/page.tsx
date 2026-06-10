import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getStaff, getBranches } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { StaffForm, EditStaffButton } from "./staff-form";

export default async function StaffPage() {
  const profile = await getCurrentProfile();
  const schoolId = profile?.school_id ?? "";

  const [staff, branches] = await Promise.all([
    getStaff({
      schoolId: schoolId || undefined,
      branchId: profile?.branch_id ?? undefined,
    }),
    schoolId ? getBranches(schoolId) : getBranches(),
  ]);
  const tableData = staff.map((row) => ({
    ...row,
    actions: schoolId ? (
      <EditStaffButton
        member={{
          id: String(row.id),
          name: String(row.name),
          email: row.email as string | null,
          role: row.role as string | null,
          branch_id: row.branch_id as string | null,
        }}
        schoolId={schoolId}
        branches={branches.map((b) => ({ id: b.id, name: b.name }))}
      />
    ) : null,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Staff</h1>

      {schoolId ? (
        <StaffForm
          schoolId={schoolId}
          branchId={profile?.branch_id ?? undefined}
          branches={branches.map((b) => ({ id: b.id, name: b.name }))}
        />
      ) : (
        <p className="text-sm text-slate-500">Assign a school to your profile to manage staff.</p>
      )}

      {staff.length === 0 ? (
        <EmptyState title="No staff yet" description="Add operations staff members" />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "name", header: "Name", accessorKey: "name", sortable: true },
            { id: "email", header: "Email", accessorKey: "email" },
            { id: "role", header: "Role", accessorKey: "role" },
            { id: "branch_name", header: "Branch", accessorKey: "branch_name" },
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
