"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bookSchema, bookIssueSchema, type BookFormData, type BookIssueFormData } from "@/lib/validations/operations";

export async function createBook(input: BookFormData) {
  const parsed = bookSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

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
  const supabase = await createClient();
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/operations/library");
  return {};
}

export async function issueBook(input: BookIssueFormData) {
  const parsed = bookIssueSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

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
