import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getRoles } from "@/lib/db";
import { getTranslations } from "next-intl/server";

export default async function RolesPage() {
  const t = await getTranslations("admin");
  const tc = await getTranslations("common");
  const roles = await getRoles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("rolesTitle")}</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          {t("rolesSubtitle")}
        </p>
      </div>

      {roles.length === 0 ? (
        <EmptyState title={t("noRoles")} description={t("noRolesDesc")} />
      ) : (
        <DataTable
          data={roles.map((role) => ({
            id: role.id,
            name: role.name.replace(/_/g, " "),
            description: role.description ?? tc("emptyDash"),
            permission_count: role.permission_count,
            permissions: role.permissions
              .map((p) => `${p.resource}:${p.action}`)
              .join(", ") || tc("emptyDash"),
          }))}
          columns={[
            { id: "name", header: t("colRole"), accessorKey: "name", sortable: true },
            { id: "description", header: tc("description"), accessorKey: "description" },
            {
              id: "permission_count",
              header: t("colPermissions"),
              accessorKey: "permission_count",
              sortable: true,
            },
            { id: "permissions", header: t("colGrantedAccess"), accessorKey: "permissions" },
          ]}
        />
      )}
    </div>
  );
}
