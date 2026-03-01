import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getGuardians } from "@/lib/db";

export default async function GuardiansPage() {
  const guardians = await getGuardians();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Guardians</h1>
        <Link href="/academic/guardians/new">
          <Button>Add Guardian</Button>
        </Link>
      </div>
      {guardians.length === 0 ? (
        <EmptyState
          title="No guardians yet"
          description="Add guardians to link with students"
          action={
            <Link href="/academic/guardians/new">
              <Button>Add Guardian</Button>
            </Link>
          }
        />
      ) : (
        <DataTable
          data={guardians}
          columns={[
            { id: "name", header: "Name", accessorKey: "name", sortable: true },
            { id: "email", header: "Email", accessorKey: "email", sortable: true },
            { id: "phone", header: "Phone", accessorKey: "phone" },
            { id: "relation", header: "Relation", accessorKey: "relation" },
            { id: "student_names", header: "Students", accessorKey: "student_names" },
          ]}
          keyExtractor={(row) => (row as { id: string }).id}
        />
      )}
    </div>
  );
}
