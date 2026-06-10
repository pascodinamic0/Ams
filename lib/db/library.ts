import { createClient } from "@/lib/supabase/server";

export type BookListItem = {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  quantity: number;
  issued_count: number;
  available: number;
};

export type LibraryIssueListItem = {
  id: string;
  book_id: string;
  book_title: string;
  student_id: string;
  student_name: string;
  issued_at: string;
  due_at: string;
  returned_at: string | null;
};

async function resolveBranchIds(
  branchId?: string,
  schoolId?: string
): Promise<string[] | null> {
  if (branchId) return [branchId];
  if (!schoolId) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("branches").select("id").eq("school_id", schoolId);
  return (data ?? []).map((b) => b.id);
}

export async function getBooks(options?: {
  branchId?: string;
  schoolId?: string;
  search?: string;
}): Promise<BookListItem[]> {
  const supabase = await createClient();
  const branchIds = await resolveBranchIds(options?.branchId, options?.schoolId);

  let query = supabase
    .from("books")
    .select("id, title, author, isbn, quantity, book_issues(id, returned_at)")
    .order("title");

  if (branchIds) {
    if (branchIds.length === 0) return [];
    query = query.in("branch_id", branchIds);
  }

  if (options?.search) {
    const term = `%${options.search}%`;
    query = query.or(`title.ilike.${term},author.ilike.${term},isbn.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getBooks error:", error);
    return [];
  }

  return (data ?? []).map((book) => {
    const issues =
      (book.book_issues as Array<{ id: string; returned_at: string | null }> | null) ?? [];
    const issuedCount = issues.filter((i) => !i.returned_at).length;
    const quantity = book.quantity ?? 0;
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      quantity,
      issued_count: issuedCount,
      available: Math.max(0, quantity - issuedCount),
    };
  });
}

export async function getBookIssues(options?: {
  branchId?: string;
  schoolId?: string;
  activeOnly?: boolean;
}): Promise<LibraryIssueListItem[]> {
  const supabase = await createClient();
  const branchIds = await resolveBranchIds(options?.branchId, options?.schoolId);
  const books = await getBooks({ branchId: options?.branchId, schoolId: options?.schoolId });
  const bookIds = books.map((b) => b.id);
  if (bookIds.length === 0) return [];

  let query = supabase
    .from("book_issues")
    .select(`
      id,
      book_id,
      student_id,
      issued_at,
      due_at,
      returned_at,
      books(title),
      students(first_name, last_name)
    `)
    .in("book_id", bookIds)
    .order("issued_at", { ascending: false });

  if (options?.activeOnly) {
    query = query.is("returned_at", null);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getBookIssues error:", error);
    return [];
  }

  return (data ?? []).map((issue) => {
    const student = issue.students as { first_name?: string; last_name?: string } | null;
    const book = issue.books as { title?: string } | null;
    return {
      id: issue.id,
      book_id: issue.book_id,
      book_title: book?.title ?? "Unknown",
      student_id: issue.student_id,
      student_name: student
        ? `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim()
        : "Unknown",
      issued_at: issue.issued_at,
      due_at: issue.due_at,
      returned_at: issue.returned_at,
    };
  });
}

export type StudentBookIssueItem = {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  issued_at: string;
  due_at: string;
  returned_at: string | null;
  status: "active" | "returned" | "overdue";
};

export async function getBookIssuesForStudent(
  studentId: string
): Promise<StudentBookIssueItem[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("book_issues")
    .select("id, issued_at, due_at, returned_at, books(title, author, isbn)")
    .eq("student_id", studentId)
    .order("issued_at", { ascending: false });

  if (error) {
    console.error("getBookIssuesForStudent error:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const book = row.books as { title?: string; author?: string | null; isbn?: string | null } | null;
    let status: StudentBookIssueItem["status"] = "active";
    if (row.returned_at) {
      status = "returned";
    } else if (row.due_at < today) {
      status = "overdue";
    }
    return {
      id: row.id,
      title: book?.title ?? "Unknown",
      author: book?.author ?? null,
      isbn: book?.isbn ?? null,
      issued_at: row.issued_at,
      due_at: row.due_at,
      returned_at: row.returned_at,
      status,
    };
  });
}

export async function getLibraryStats(options?: {
  branchId?: string;
  schoolId?: string;
}) {
  const books = await getBooks(options);
  const issues = await getBookIssues({ ...options, activeOnly: true });
  const today = new Date().toISOString().slice(0, 10);
  const overdue = issues.filter((i) => i.due_at < today).length;

  return {
    totalBooks: books.reduce((sum, b) => sum + b.quantity, 0),
    titles: books.length,
    activeIssues: issues.length,
    overdueIssues: overdue,
  };
}
