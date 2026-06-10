import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getRoles } from "@/lib/db";

export default async function RolesPage() {
  const roles = await getRoles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Roles & Permissions</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          RBAC roles and their resource permissions
        </p>
      </div>

      {roles.length === 0 ? (
        <EmptyState title="No roles" description="Default roles are seeded during migration" />
      ) : (
        <DataTable
          data={roles.map((role) => ({
            id: role.id,
            name: role.name.replace(/_/g, " "),
            description: role.description ?? "—",
            permission_count: role.permission_count,
            permissions: role.permissions
              .map((p) => `${p.resource}:${p.action}`)
              .join(", ") || "—",
          }))}
          columns={[
            { id: "name", header: "Role", accessorKey: "name", sortable: true },
            { id: "description", header: "Description", accessorKey: "description" },
            {
              id: "permission_count",
              header: "Permissions",
              accessorKey: "permission_count",
              sortable: true,
            },
            { id: "permissions", header: "Granted access", accessorKey: "permissions" },
          ]}
        />
      )}
    </div>
  );
}
