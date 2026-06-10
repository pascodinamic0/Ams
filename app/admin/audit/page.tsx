import { Suspense } from "react";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuditLogs, getAuditEntityTypes } from "@/lib/db";
import { AuditFilters } from "./audit-filters";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; startDate?: string; endDate?: string }>;
}) {
  const params = await searchParams;

  const [logs, entityTypes] = await Promise.all([
    getAuditLogs({
      entityType: params.entityType,
      startDate: params.startDate,
      endDate: params.endDate,
    }),
    getAuditEntityTypes(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Logs</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">System audit trail for key entities</p>
      </div>

      <Suspense fallback={null}>
        <AuditFilters entityTypes={entityTypes} />
      </Suspense>

      {logs.length === 0 ? (
        <EmptyState title="No audit entries" description="Changes to tracked tables will appear here" />
      ) : (
        <DataTable
          data={logs.map((log) => ({
            ...log,
            user: log.user_name ?? "System",
            created_at: formatTimestamp(log.created_at),
          }))}
          columns={[
            { id: "created_at", header: "Timestamp", accessorKey: "created_at", sortable: true },
            { id: "user", header: "User", accessorKey: "user", sortable: true },
            { id: "action", header: "Action", accessorKey: "action" },
            { id: "entity_type", header: "Entity", accessorKey: "entity_type", sortable: true },
            { id: "entity_id", header: "Entity ID", accessorKey: "entity_id" },
          ]}
        />
      )}
    </div>
  );
}
