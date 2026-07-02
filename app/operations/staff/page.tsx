import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getStaff, getSchoolCampusId } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { StaffForm, EditStaffButton } from "./staff-form";

export default async function StaffPage() {
  const t = await getTranslations("operations");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  const schoolId = profile?.school_id ?? "";
  const campusId =
    profile?.branch_id ?? (schoolId ? await getSchoolCampusId(schoolId) : null) ?? undefined;

  const staff = await getStaff({
    schoolId: schoolId || undefined,
    branchId: campusId,
  });

  const tableData = staff.map((row) => ({
    ...row,
    actions: schoolId ? (
      <EditStaffButton
        member={{
          id: String(row.id),
          name: String(row.name),
          email: row.email as string | null,
          role: row.role as string | null,
        }}
        schoolId={schoolId}
        campusId={campusId}
      />
    ) : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("staffTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {t("staffSubtitle")}
        </p>
      </div>

      {schoolId ? (
        <StaffForm schoolId={schoolId} campusId={campusId} />
      ) : (
        <p className="text-sm text-stone-500">{t("assignSchoolStaff")}</p>
      )}

      {staff.length === 0 ? (
        <EmptyState title={t("noStaff")} description={t("noStaffDesc")} />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "name", header: tc("name"), accessorKey: "name", sortable: true },
            { id: "email", header: tc("email"), accessorKey: "email" },
            { id: "role", header: t("colRole"), accessorKey: "role" },
            { id: "actions", header: "", accessorKey: "actions" },
          ]}
        />
      )}
    </div>
  );
}
