import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getSchools } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { SchoolStatusActions } from "./school-status-actions";
import { SchoolStatusBadge } from "./school-status-badge";

export default async function SchoolsPage() {
  const t = await getTranslations("admin");
  const tc = await getTranslations("common");
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
        <h1 className="text-2xl font-bold">{t("schoolsTitle")}</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/websites">
            <Button variant="outline">{t("websitesTitle")}</Button>
          </Link>
          <Link href="/admin/schools/new">
            <Button>{t("addSchool")}</Button>
          </Link>
        </div>
      </div>
      {schools.length === 0 ? (
        <EmptyState
          title={t("noSchoolsYet")}
          description={t("noSchoolsDesc")}
          action={
            <Link href="/admin/schools/new">
              <Button>{t("addSchool")}</Button>
            </Link>
          }
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "name", header: tc("name"), accessorKey: "name_link", sortable: true },
            { id: "region", header: t("colRegion"), accessorKey: "region" },
            { id: "status", header: tc("status"), accessorKey: "status_badge" },
            { id: "actions", header: tc("actions"), accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
