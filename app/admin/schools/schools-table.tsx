"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/ui/data-table";
import { hasPaidAccess } from "@/lib/billing/types";
import type { SchoolListItem } from "@/lib/db/schools";
import { BillingExemptToggle } from "./[id]/billing-exempt-button";
import { SchoolStatusActions } from "./school-status-actions";
import { SchoolStatusBadge } from "./school-status-badge";

export function SchoolsTable({ schools }: { schools: SchoolListItem[] }) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");

  const tableData = schools.map((row) => {
    const paid = hasPaidAccess(row);
    return {
      id: row.id,
      name: row.name,
      region: row.region,
      name_link: (
        <Link
          href={`/admin/schools/${row.id}`}
          className="text-blue-600 hover:underline"
        >
          {row.name}
        </Link>
      ),
      status_badge: <SchoolStatusBadge status={row.status} />,
      billing_cell: (
        <div className="space-y-1.5">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {row.billing_exempt
              ? t("billingStatusExempt")
              : paid
                ? t("billingStatusSubscribed", {
                    status: row.subscription_status,
                  })
                : t("billingStatusNeedsPayment")}
          </p>
          <BillingExemptToggle
            schoolId={row.id}
            billingExempt={row.billing_exempt}
            compact
          />
        </div>
      ),
      actions: (
        <SchoolStatusActions
          schoolId={row.id}
          schoolName={row.name}
          status={row.status}
        />
      ),
    };
  });

  return (
    <DataTable
      data={tableData}
      columns={[
        {
          id: "name",
          header: tc("name"),
          accessorKey: "name_link",
          sortable: true,
        },
        { id: "region", header: t("colRegion"), accessorKey: "region" },
        { id: "status", header: tc("status"), accessorKey: "status_badge" },
        { id: "billing", header: t("colBilling"), accessorKey: "billing_cell" },
        { id: "actions", header: tc("actions"), accessorKey: "actions" },
      ]}
    />
  );
}
