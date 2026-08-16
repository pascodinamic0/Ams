import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logQueryError } from "@/lib/supabase/log-query-error";
import { formatPersonName } from "@/lib/utils";
import { LESSON_MATERIALS_BUCKET } from "@/lib/lesson-materials/constants";

export { LESSON_MATERIALS_BUCKET } from "@/lib/lesson-materials/constants";

export type TeacherSubjectOption = {
  id: string;
  name: string;
};

export type LessonMaterialAttachmentItem = {
  id: string;
  kind: "file" | "link";
  file_name: string | null;
  url: string | null;
  mime_type: string | null;
  size_bytes: number | null;
};

export type TeacherLessonMaterialSummary = {
  id: string;
  title: string;
  lesson_date: string;
  subject_name: string | null;
  recipient_count: number;
  created_at: string;
};

export type StudentLessonMaterialItem = {
  id: string;
  title: string;
  note: string | null;
  lesson_date: string;
  subject_name: string | null;
  teacher_name: string | null;
  class_name: string | null;
  attachments: LessonMaterialAttachmentItem[];
};

export type GuardianLessonMaterialItem = StudentLessonMaterialItem & {
  student_id: string;
  student_name: string;
};

export async function getTeacherSubjectsForClass(
  teacherId: string,
  classId: string
): Promise<TeacherSubjectOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("timetable_slots")
    .select("subject_id, subjects(id, name)")
    .eq("teacher_id", teacherId)
    .eq("class_id", classId)
    .not("subject_id", "is", null);

  if (error) {
    logQueryError("getTeacherSubjectsForClass error:", error);
    return [];
  }

  const byId = new Map<string, TeacherSubjectOption>();
  for (const row of data ?? []) {
    const subject = row.subjects as { id?: string; name?: string } | null;
    if (subject?.id && subject?.name && !byId.has(subject.id)) {
      byId.set(subject.id, { id: subject.id, name: subject.name });
    }
  }

  if (byId.size > 0) {
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  const { data: cls, error: classError } = await supabase
    .from("classes")
    .select("branch_id")
    .eq("id", classId)
    .single();

  if (classError || !cls?.branch_id) return [];

  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("branch_id", cls.branch_id)
    .order("name");

  if (subjectsError) {
    logQueryError("getTeacherSubjectsForClass fallback error:", subjectsError);
    return [];
  }

  return (subjects ?? []).map((s) => ({ id: s.id, name: s.name }));
}

export async function getLessonMaterialsSentForClassDate(
  teacherId: string,
  classId: string,
  lessonDate: string
): Promise<TeacherLessonMaterialSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lesson_materials")
    .select(`
      id,
      title,
      lesson_date,
      created_at,
      subjects(name),
      lesson_material_recipients(id)
    `)
    .eq("teacher_id", teacherId)
    .eq("class_id", classId)
    .eq("lesson_date", lessonDate)
    .order("created_at", { ascending: false });

  if (error) {
    logQueryError("getLessonMaterialsSentForClassDate error:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    lesson_date: row.lesson_date,
    subject_name: relationName(row.subjects as { name?: string } | { name?: string }[] | null),
    recipient_count: (row.lesson_material_recipients as { id: string }[] | null)?.length ?? 0,
    created_at: row.created_at,
  }));
}

async function resolveAttachmentUrls(
  attachments: Array<{
    id: string;
    kind: string;
    storage_path: string | null;
    url: string | null;
    file_name: string | null;
    mime_type: string | null;
    size_bytes: number | null;
  }>
): Promise<LessonMaterialAttachmentItem[]> {
  const admin = createAdminClient();
  const results: LessonMaterialAttachmentItem[] = [];

  for (const att of attachments) {
    let resolvedUrl = att.url;
    if (att.kind === "file" && att.storage_path && admin) {
      const { data, error } = await admin.storage
        .from(LESSON_MATERIALS_BUCKET)
        .createSignedUrl(att.storage_path, 60 * 60);
      if (!error && data?.signedUrl) {
        resolvedUrl = data.signedUrl;
      }
    }

    results.push({
      id: att.id,
      kind: att.kind as "file" | "link",
      file_name: att.file_name,
      url: resolvedUrl,
      mime_type: att.mime_type,
      size_bytes: att.size_bytes,
    });
  }

  return results;
}

const materialSelect = `
  id,
  title,
  note,
  lesson_date,
  subjects(name),
  profiles(name),
  classes(name),
  lesson_material_attachments(
    id,
    kind,
    storage_path,
    url,
    file_name,
    mime_type,
    size_bytes,
    sort_order
  )
`;

type MaterialJoinRow = {
  id: string;
  title: string;
  note: string | null;
  lesson_date: string;
  subjects: { name?: string } | { name?: string }[] | null;
  profiles: { name?: string } | { name?: string }[] | null;
  classes: { name?: string } | { name?: string }[] | null;
  lesson_material_attachments: Array<{
    id: string;
    kind: string;
    storage_path: string | null;
    url: string | null;
    file_name: string | null;
    mime_type: string | null;
    size_bytes: number | null;
    sort_order: number;
  }> | null;
};

function unwrapJoin<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function relationName(
  value: { name?: string } | { name?: string }[] | null | undefined
): string | null {
  return unwrapJoin(value)?.name ?? null;
}

async function mapMaterialRow(material: MaterialJoinRow): Promise<StudentLessonMaterialItem> {
  const attachmentsRaw = [...(material.lesson_material_attachments ?? [])];
  attachmentsRaw.sort((a, b) => a.sort_order - b.sort_order);

  return {
    id: material.id,
    title: material.title,
    note: material.note,
    lesson_date: material.lesson_date,
    subject_name: relationName(material.subjects),
    teacher_name: relationName(material.profiles),
    class_name: relationName(material.classes),
    attachments: await resolveAttachmentUrls(attachmentsRaw),
  };
}

function normalizeMaterialJoin(
  value: MaterialJoinRow | MaterialJoinRow[] | null | undefined
): MaterialJoinRow | null {
  return unwrapJoin(value);
}

export async function getLessonMaterialsForStudent(
  studentId: string
): Promise<StudentLessonMaterialItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lesson_material_recipients")
    .select(`
      material_id,
      created_at,
      lesson_materials!inner(${materialSelect})
    `)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    logQueryError("getLessonMaterialsForStudent error:", error);
    return [];
  }

  const items: StudentLessonMaterialItem[] = [];
  for (const row of data ?? []) {
    const material = normalizeMaterialJoin(
      row.lesson_materials as MaterialJoinRow | MaterialJoinRow[] | null
    );
    if (!material) continue;
    items.push(await mapMaterialRow(material));
  }

  return items;
}

export async function getRecentLessonMaterialsForStudent(
  studentId: string,
  limit = 3
): Promise<StudentLessonMaterialItem[]> {
  const all = await getLessonMaterialsForStudent(studentId);
  return all.slice(0, limit);
}

export async function getLessonMaterialsForGuardianStudents(
  children: { id: string; name: string }[]
): Promise<GuardianLessonMaterialItem[]> {
  const rows: GuardianLessonMaterialItem[] = [];
  for (const child of children) {
    const materials = await getLessonMaterialsForStudent(child.id);
    for (const m of materials) {
      rows.push({ ...m, student_id: child.id, student_name: child.name });
    }
  }
  return rows.sort(
    (a, b) => new Date(b.lesson_date).getTime() - new Date(a.lesson_date).getTime()
  );
}

export async function getLessonMaterialByIdForStudent(
  materialId: string,
  studentId: string
): Promise<StudentLessonMaterialItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lesson_material_recipients")
    .select(`
      student_id,
      lesson_materials!inner(${materialSelect})
    `)
    .eq("material_id", materialId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (error || !data?.lesson_materials) {
    if (error) logQueryError("getLessonMaterialByIdForStudent error:", error);
    return null;
  }

  const material = normalizeMaterialJoin(
    data.lesson_materials as MaterialJoinRow | MaterialJoinRow[] | null
  );
  if (!material) return null;

  return mapMaterialRow(material);
}

export async function formatStudentNameById(studentId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("first_name, middle_name, last_name")
    .eq("id", studentId)
    .maybeSingle();
  if (!data) return "Student";
  return formatPersonName(data);
}
