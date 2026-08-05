"use server";

import { revalidatePath } from "next/cache";
import { assertBranchAccess, assertStudentAccess } from "@/lib/auth/assert";
import { OPERATIONS_PORTAL_ROLES } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { bookSchema, bookIssueSchema, type BookFormData, type BookIssueFormData } from "@/lib/validations/operations";

async function assertBookAccess(bookId: string) {
  const supabase = await createClient();
  const { data: book } = await supabase
    .from("books")
    .select("branch_id")
    .eq("id", bookId)
    .maybeSingle();
  if (!book) return { ok: false as const, error: "Book not found" };

  const access = await assertBranchAccess(book.branch_id, OPERATIONS_PORTAL_ROLES);
  if (!access.ok) return access;
  return { ...access, branchId: book.branch_id };
}

async function assertBookIssueAccess(issueId: string) {
  const supabase = await createClient();
  const { data: issue } = await supabase
    .from("book_issues")
    .select("book_id, student_id")
    .eq("id", issueId)
    .maybeSingle();
  if (!issue) return { ok: false as const, error: "Book issue not found" };

  const bookAccess = await assertBookAccess(issue.book_id);
  if (!bookAccess.ok) return bookAccess;

  const studentAccess = await assertStudentAccess(
    issue.student_id,
    OPERATIONS_PORTAL_ROLES
  );
  if (!studentAccess.ok) return studentAccess;
  if (studentAccess.schoolId !== bookAccess.schoolId) {
    return { ok: false as const, error: "Student does not belong to this school" };
  }

  return bookAccess;
}

export async function createBook(input: BookFormData) {
  const parsed = bookSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertBranchAccess(
    parsed.data.branch_id,
    OPERATIONS_PORTAL_ROLES
  );
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/operations/library");
  return { data: { id: data.id } };
}

export async function deleteBook(id: string) {
  const access = await assertBookAccess(id);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("books")
    .delete()
    .eq("id", id)
    .eq("branch_id", access.branchId);
  if (error) return { error: error.message };
  revalidatePath("/operations/library");
  return {};
}

export async function issueBook(input: BookIssueFormData) {
  const parsed = bookIssueSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const bookAccess = await assertBookAccess(parsed.data.book_id);
  if (!bookAccess.ok) return { error: bookAccess.error };

  const studentAccess = await assertStudentAccess(
    parsed.data.student_id,
    OPERATIONS_PORTAL_ROLES
  );
  if (!studentAccess.ok) return { error: studentAccess.error };
  if (studentAccess.schoolId !== bookAccess.schoolId) {
    return { error: "Student does not belong to this school" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("book_issues")
    .insert({
      book_id: parsed.data.book_id,
      student_id: parsed.data.student_id,
      due_at: parsed.data.due_at,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/operations/library");
  return { data: { id: data.id } };
}

export async function returnBook(issueId: string) {
  const access = await assertBookIssueAccess(issueId);
  if (!access.ok) return { error: access.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("book_issues")
    .update({ returned_at: new Date().toISOString() })
    .eq("id", issueId)
    .is("returned_at", null);

  if (error) return { error: error.message };
  revalidatePath("/operations/library");
  return {};
}
