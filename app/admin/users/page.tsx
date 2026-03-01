import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getUsers } from "@/lib/db";

export default async function UsersPage() {
  const users = await getUsers();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      {users.length === 0 ? (
        <EmptyState title="No users" description="Add users to your platform" />
      ) : (
        <DataTable
          data={users}
          columns={[
            { id: "name", header: "Name", accessorKey: "name", sortable: true },
            { id: "role", header: "Role", accessorKey: "role" },
            { id: "school_name", header: "School", accessorKey: "school_name" },
          ]}
          keyExtractor={(r) => (r as { id: string }).id}
        />
      )}
    </div>
  );
}
