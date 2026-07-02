import { Suspense } from "react";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuditLogs, getAuditEntityTypes } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { AuditFilters } from "./audit-filters";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; startDate?: string; endDate?: string }>;
}) {
  const t = await getTranslations("admin");
  const tc = await getTranslations("common");
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
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("auditTitle")}</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">{t("auditSubtitle")}</p>
      </div>

      <Suspense fallback={null}>
        <AuditFilters entityTypes={entityTypes} />
      </Suspense>

      {logs.length === 0 ? (
        <EmptyState title={t("noAuditEntries")} description={t("noAuditDesc")} />
      ) : (
        <DataTable
          data={logs.map((log) => ({
            ...log,
            user: log.user_name ?? t("systemUser"),
            created_at: formatTimestamp(log.created_at),
          }))}
          columns={[
            { id: "created_at", header: t("colTimestamp"), accessorKey: "created_at", sortable: true },
            { id: "user", header: tc("user"), accessorKey: "user", sortable: true },
            { id: "action", header: t("colAction"), accessorKey: "action" },
            { id: "entity_type", header: t("colEntity"), accessorKey: "entity_type", sortable: true },
            { id: "entity_id", header: t("colEntityId"), accessorKey: "entity_id" },
          ]}
        />
      )}
    </div>
  );
}
