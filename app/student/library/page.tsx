import { format } from "date-fns";
import { getCurrentProfile } from "@/lib/auth/session";
import { getStudentByAuthUserId, getBookIssuesForStudent } from "@/lib/db";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getTranslations } from "next-intl/server";

const statusStyles: Record<string, string> = {
  active: "text-blue-600",
  returned: "text-green-600",
  overdue: "text-red-600",
};

export default async function StudentLibraryPage() {
  const t = await getTranslations("student");
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <EmptyState title={t("notSignedIn")} description={t("notSignedInDescLibrary")} />
    );
  }

  const student = await getStudentByAuthUserId(profile.id);
  if (!student) {
    return (
      <EmptyState
        title={t("noStudentProfile")}
        description={t("noStudentProfileDescShort")}
      />
    );
  }

  const statusLabels: Record<string, string> = {
    active: t("statusActive"),
    returned: t("statusReturned"),
    overdue: t("statusOverdue"),
  };

  const issues = await getBookIssuesForStudent(student.id);
  const tableData = issues.map((row) => ({
    ...row,
    issued_at_display: format(new Date(row.issued_at), "MMM d, yyyy"),
    due_at_display: format(new Date(row.due_at), "MMM d, yyyy"),
    status_display: (
      <span className={`font-medium ${statusStyles[row.status] ?? ""}`}>
        {statusLabels[row.status] ?? row.status}
      </span>
    ),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("libraryTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("librarySubtitle")}</p>
      </div>

      {issues.length === 0 ? (
        <EmptyState
          title={t("noBooksIssued")}
          description={t("noBooksIssuedDesc")}
        />
      ) : (
        <DataTable
          data={tableData}
          columns={[
            { id: "title", header: t("colTitle"), accessorKey: "title", sortable: true },
            { id: "author", header: t("colAuthor"), accessorKey: "author" },
            { id: "issued_at", header: t("colIssued"), accessorKey: "issued_at_display" },
            { id: "due_at", header: t("colDue"), accessorKey: "due_at_display" },
            { id: "status", header: t("colStatus"), accessorKey: "status_display" },
          ]}
        />
      )}
    </div>
  );
}
