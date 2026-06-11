import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getSchools } from "@/lib/db";
import { SchoolStatusActions } from "./school-status-actions";
import { SchoolStatusBadge } from "./school-status-badge";

export default async function SchoolsPage() {
  const schools = await getSchools();
  const tableData = schools.map((row) => ({
    ...row,
    name_link: (
      <Link href={`/admin/schools/${row.id}`} className="text-blue-600 hover:underline">
        {row.name}
      </Link>
    ),
    status_badge: <SchoolStatusBadge status={row.status} />,
    actions: (
      <SchoolStatusActions
        schoolId={row.id}
        schoolName={row.name}
        status={row.status}
      />
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Schools</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/websites">
            <Button variant="outline">School Websites</Button>
          </Link>
          <Link href="/admin/schools/new">
            <Button>Add School</Button>
          </Link>
        </div>
      </div>
      {schools.length === 0 ? (
        <EmptyState
          title="No schools yet"
          description="Add your first school to get started"
          action={
            <Link href="/admin/schools/new">
              <Button>Add School</Button>
            </Link>
          }
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "name", header: "Name", accessorKey: "name_link", sortable: true },
            { id: "region", header: "Region", accessorKey: "region" },
            { id: "status", header: "Status", accessorKey: "status_badge" },
            { id: "actions", header: "Actions", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
