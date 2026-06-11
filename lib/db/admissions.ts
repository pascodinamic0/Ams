import { createClient } from "@/lib/supabase/server";

export type AdmissionListItem = {
  id: string;
  student_name: string;
  guardian_name: string;
  guardian_email: string;
  class_applying: string | null;
  source: string;
  status: string;
  requires_campus_visit: boolean;
  campus_visit_title: string | null;
  campus_visit_date: string | null;
  campus_visit_time: string | null;
  campus_visit_status: string | null;
  created_at: string;
};

export async function getAdmissions(schoolId?: string): Promise<AdmissionListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("admission_applications")
    .select(
      `id, student_name, guardian_name, guardian_email, class_applying, source, status, requires_campus_visit, created_at,
      campus_visit:event_registrations (
        status,
        events (title, date, start_time)
      )`
    )
    .order("created_at", { ascending: false });

  if (schoolId) query = query.eq("school_id", schoolId);

  const { data, error } = await query;
  if (error) {
    console.error("getAdmissions error:", error);
    return [];
  }
  return (data ?? []).map((row) => {
    const visits = row.campus_visit as
      | Array<{
          status: string;
          events: { title: string; date: string; start_time: string | null } | null;
        }>
      | null;
    const visit = visits?.[0];
    const event = visit?.events;
    return {
      id: row.id,
      student_name: row.student_name,
      guardian_name: row.guardian_name,
      guardian_email: row.guardian_email,
      class_applying: row.class_applying,
      source: row.source,
      status: row.status,
      requires_campus_visit: row.requires_campus_visit,
      campus_visit_title: event?.title ?? null,
      campus_visit_date: event?.date ?? null,
      campus_visit_time: event?.start_time ?? null,
      campus_visit_status: visit?.status ?? null,
      created_at: row.created_at,
    };
  });
}
