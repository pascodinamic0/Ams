import { createClient } from "@/lib/supabase/server";

export type CurriculumListItem = {
  id: string;
  branch_id: string;
  grade: string;
  subject_id: string;
  subject_name: string;
  syllabus: string | null;
};

export type CurriculumWrite = {
  branch_id: string;
  grade: string;
  subject_id: string;
  syllabus?: string | null;
};

function mapCurriculumRows(data: unknown[]): CurriculumListItem[] {
  return data.map((row) => {
    const r = row as {
      id: string;
      branch_id: string;
      grade: string;
      subject_id: string;
      syllabus: string | null;
      subjects: { name?: string } | null;
    };
    return {
      id: r.id,
      branch_id: r.branch_id,
      grade: r.grade,
      subject_id: r.subject_id,
      subject_name: r.subjects?.name ?? "Unknown",
      syllabus: r.syllabus,
    };
  });
}

export async function getCurriculum(branchId: string): Promise<CurriculumListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("curriculum")
    .select("id, branch_id, grade, subject_id, syllabus, subjects(name)")
    .eq("branch_id", branchId)
    .order("grade")
    .order("subject_id");

  if (error) {
    console.error("getCurriculum error:", error);
    return [];
  }

  return mapCurriculumRows(data ?? []);
}

export async function getCurriculumById(id: string): Promise<CurriculumListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("curriculum")
    .select("id, branch_id, grade, subject_id, syllabus, subjects(name)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getCurriculumById error:", error);
    return null;
  }

  return mapCurriculumRows([data])[0] ?? null;
}

export async function insertCurriculum(
  payload: CurriculumWrite
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("curriculum")
    .insert({
      branch_id: payload.branch_id,
      grade: payload.grade,
      subject_id: payload.subject_id,
      syllabus: payload.syllabus ?? null,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("insertCurriculum error:", error);
    return { error: error.message };
  }

  return { id: data.id };
}

export async function updateCurriculum(
  id: string,
  payload: Partial<CurriculumWrite>
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("curriculum")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("updateCurriculum error:", error);
    return { error: error.message };
  }

  return {};
}

export async function deleteCurriculum(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("curriculum").delete().eq("id", id);

  if (error) {
    console.error("deleteCurriculum error:", error);
    return { error: error.message };
  }

  return {};
}
