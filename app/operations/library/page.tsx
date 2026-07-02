import { Suspense } from "react";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getBooks, getBookIssues, getStudents } from "@/lib/db";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { BookForm, IssueBookForm, ReturnBookButton } from "./library-forms";
import { LibrarySearch } from "./library-search";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const t = await getTranslations("operations");
  const tc = await getTranslations("common");
  const { search } = await searchParams;
  const profile = await getCurrentProfile();
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };

  const [books, issues, students] = await Promise.all([
    getBooks({ ...scope, search }),
    getBookIssues({ ...scope, activeOnly: true }),
    getStudents(scope),
  ]);

  const branchId = profile?.branch_id ?? "";
  const today = new Date().toISOString().slice(0, 10);
  const issueTableData = issues.map((row) => {
    const due = String(row.due_at);
    const overdue = due < today;
    return {
      ...row,
      issued_at_display: new Date(String(row.issued_at)).toLocaleDateString(),
      due_at_display: (
        <span className={overdue ? "font-medium text-red-600" : undefined}>{due}</span>
      ),
      actions: <ReturnBookButton issueId={String(row.id)} />,
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("libraryTitle")}</h1>

      <Suspense fallback={null}>
        <LibrarySearch />
      </Suspense>

      {branchId ? (
        <BookForm branchId={branchId} />
      ) : (
        <p className="text-sm text-stone-500">{t("assignSchoolBooks")}</p>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold">{t("booksSection")}</h2>
        {books.length === 0 ? (
          <EmptyState title={t("noBooks")} description={t("noBooksDesc")} />
        ) : (
          <DataTable
            data={books}
            columns={[
              { id: "title", header: t("colTitle"), accessorKey: "title", sortable: true },
              { id: "author", header: t("colAuthor"), accessorKey: "author" },
              { id: "isbn", header: t("colIsbn"), accessorKey: "isbn" },
              { id: "quantity", header: t("colCopies"), accessorKey: "quantity", sortable: true },
              { id: "issued_count", header: t("colIssued"), accessorKey: "issued_count" },
              { id: "available", header: t("colAvailable"), accessorKey: "available", sortable: true },
            ]}
          />
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">{t("issueBookSection")}</h2>
        <IssueBookForm
          books={books}
          students={students.map((s) => ({ id: s.id, name: s.name }))}
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">{t("activeLoans")}</h2>
        {issues.length === 0 ? (
          <EmptyState title={t("noActiveLoans")} description={t("noActiveLoansDesc")} />
        ) : (
          <DataTable
            data={issueTableData}
            columns={[
              { id: "book_title", header: t("colBook"), accessorKey: "book_title", sortable: true },
              { id: "student_name", header: t("colStudent"), accessorKey: "student_name", sortable: true },
              { id: "issued_at", header: t("colIssuedDate"), accessorKey: "issued_at_display" },
              { id: "due_at", header: t("colDueDate"), accessorKey: "due_at_display" },
              { id: "actions", header: "", accessorKey: "actions" },
            ]}
          />
        )}
      </div>
    </div>
  );
}
