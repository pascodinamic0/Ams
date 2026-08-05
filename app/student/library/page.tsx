import { format } from "date-fns";
import { getCurrentProfile } from "@/lib/auth/session";
import { getStudentByAuthUserId, getBookIssuesForStudent, getBooks } from "@/lib/db";
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

  const [issues, catalog] = await Promise.all([
    getBookIssuesForStudent(student.id),
    getBooks({ schoolId: student.school_id ?? undefined }),
  ]);

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

  const catalogData = catalog.map((book) => ({
    ...book,
    available_display:
      book.available > 0 ? t("copiesAvailable", { count: book.available }) : t("unavailable"),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">{t("libraryTitle")}</h1>
        <p className="mt-1 text-sm text-stone-500">{t("librarySubtitle")}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
          {t("myIssuedBooks")}
        </h2>
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
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
            {t("catalogTitle")}
          </h2>
          <p className="text-sm text-stone-500">{t("catalogSubtitle")}</p>
        </div>
        {catalog.length === 0 ? (
          <EmptyState
            title={t("noCatalogBooks")}
            description={t("noCatalogBooksDesc")}
          />
        ) : (
          <DataTable
            data={catalogData}
            columns={[
              { id: "title", header: t("colTitle"), accessorKey: "title", sortable: true },
              { id: "author", header: t("colAuthor"), accessorKey: "author" },
              { id: "isbn", header: t("colIsbn"), accessorKey: "isbn" },
              {
                id: "available",
                header: t("colAvailable"),
                accessorKey: "available_display",
              },
            ]}
          />
        )}
      </section>
    </div>
  );
}
