import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";

async function getSchools() {
  return [];
}

export default async function SchoolsPage() {
  const schools = await getSchools();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Schools</h1>
        <Link href="/admin/schools/new">
          <Button>Add School</Button>
        </Link>
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
          data={schools}
          columns={[
            { id: "name", header: "Name", accessorKey: "name", sortable: true },
            { id: "region", header: "Region", accessorKey: "region" },
            { id: "status", header: "Status", accessorKey: "status" },
          ]}
          keyExtractor={(row) => (row as { id: string }).id}
        />
      )}
    </div>
  );
}
