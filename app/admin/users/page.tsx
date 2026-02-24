import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";

export default async function UsersPage() {
  const users: { id: string; email: string; role: string }[] = [];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      {users.length === 0 ? (
        <EmptyState title="No users" description="Add users to your platform" />
      ) : (
        <DataTable
          data={users}
          columns={[
            { id: "email", header: "Email", accessorKey: "email", sortable: true },
            { id: "role", header: "Role", accessorKey: "role" },
          ]}
          keyExtractor={(r) => (r as { id: string }).id}
        />
      )}
    </div>
  );
}
