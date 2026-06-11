import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getStaff, getSchoolCampusId } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { StaffForm, EditStaffButton } from "./staff-form";

export default async function StaffPage() {
  const profile = await getCurrentProfile();
  const schoolId = profile?.school_id ?? "";
  const campusId =
    profile?.branch_id ?? (schoolId ? await getSchoolCampusId(schoolId) : null) ?? undefined;

  const staff = await getStaff({
    schoolId: schoolId || undefined,
    branchId: campusId,
  });

  const tableData = staff.map((row) => ({
    ...row,
    actions: schoolId ? (
      <EditStaffButton
        member={{
          id: String(row.id),
          name: String(row.name),
          email: row.email as string | null,
          role: row.role as string | null,
        }}
        schoolId={schoolId}
        campusId={campusId}
      />
    ) : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Staff</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Operations team for your school campus.
        </p>
      </div>

      {schoolId ? (
        <StaffForm schoolId={schoolId} campusId={campusId} />
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
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
