import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdmissions } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { AdmissionActions } from "./admission-actions";

export default async function AdmissionsPage() {
  const t = await getTranslations("academic");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  const admissions = await getAdmissions(profile?.school_id ?? undefined);
  const branchId = profile?.branch_id ?? "";
  function formatVisitDate(date: string, time: string | null) {
    const formatted = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return time ? `${formatted} ${time.slice(0, 5)}` : formatted;
  }

  const tableData = admissions.map((row) => ({
    ...row,
    campus_visit: row.campus_visit_date ? (
      <div>
        <p className="text-sm">{formatVisitDate(row.campus_visit_date, row.campus_visit_time)}</p>
        {row.campus_visit_status && (
          <p className="text-xs capitalize text-stone-500">{row.campus_visit_status}</p>
        )}
      </div>
    ) : row.requires_campus_visit ? (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
        {t("notBooked")}
      </span>
    ) : (
      "—"
    ),
    actions: (
      <AdmissionActions id={row.id as string} status={row.status as string} branchId={branchId} />
    ),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("admissionsTitle")}</h1>
      {admissions.length === 0 ? (
        <EmptyState title={t("noApplications")} description={t("noApplicationsDesc")} />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "student", header: t("studentsTitle"), accessorKey: "student_name", sortable: true },
            { id: "guardian", header: t("guardian"), accessorKey: "guardian_name" },
            { id: "class", header: t("class"), accessorKey: "class_applying" },
            { id: "source", header: t("source"), accessorKey: "source" },
            { id: "campus_visit", header: t("campusVisit"), accessorKey: "campus_visit" },
            { id: "status", header: tc("status"), accessorKey: "status" },
            { id: "actions", header: tc("actions"), accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
