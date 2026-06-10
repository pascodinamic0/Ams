import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdmissions } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { AdmissionActions } from "./admission-actions";

export default async function AdmissionsPage() {
  const profile = await getCurrentProfile();
  const admissions = await getAdmissions(profile?.school_id ?? undefined);
  const branchId = profile?.branch_id ?? "";
  const tableData = admissions.map((row) => ({
    ...row,
    actions: (
      <AdmissionActions id={row.id as string} status={row.status as string} branchId={branchId} />
    ),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admissions</h1>
      {admissions.length === 0 ? (
        <EmptyState title="No applications" description="Online and manual applications will appear here" />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "student", header: "Student", accessorKey: "student_name", sortable: true },
            { id: "guardian", header: "Guardian", accessorKey: "guardian_name" },
            { id: "class", header: "Class", accessorKey: "class_applying" },
            { id: "source", header: "Source", accessorKey: "source" },
            { id: "status", header: "Status", accessorKey: "status" },
            { id: "actions", header: "Actions", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
