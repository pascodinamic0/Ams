import { createClient } from "@/lib/supabase/server";

export type AdmissionListItem = {
  id: string;
  student_name: string;
  guardian_name: string;
  guardian_email: string;
  class_applying: string | null;
  source: string;
  status: string;
  created_at: string;
};

export async function getAdmissions(schoolId?: string): Promise<AdmissionListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("admission_applications")
    .select("id, student_name, guardian_name, guardian_email, class_applying, source, status, created_at")
    .order("created_at", { ascending: false });

  if (schoolId) query = query.eq("school_id", schoolId);

  const { data, error } = await query;
  if (error) {
    console.error("getAdmissions error:", error);
    return [];
  }
  return data ?? [];
}
