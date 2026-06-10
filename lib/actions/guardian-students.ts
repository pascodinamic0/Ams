"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function linkGuardianToStudent(guardianId: string, studentId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("guardian_students").insert({
    guardian_id: guardianId,
    student_id: studentId,
  });

  if (error) return { error: error.message };
  revalidatePath("/academic/students");
  revalidatePath("/academic/guardians");
  return {};
}
