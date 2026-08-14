import { actionError } from "@/lib/i18n/action-error";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/services/notifications";
import { canOverrideClassCapacity } from "@/lib/auth/rbac";
import { getTranslations } from "next-intl/server";

export type AssertClassCapacityInput = {
  classId: string;
  excludeStudentId?: string;
  override?: boolean;
  callerRole?: string | null;
};

export type ClassCapacityInfo = {
  capacity: number | null;
  studentCount: number;
  isFull: boolean;
  className: string;
};

/** Count active students in a class and compare to capacity. */
export async function getClassCapacityInfo(
  classId: string,
  excludeStudentId?: string
): Promise<ClassCapacityInfo | null> {
  const supabase = await createClient();

  const { data: cls, error: classError } = await supabase
    .from("classes")
    .select("id, name, capacity")
    .eq("id", classId)
    .maybeSingle();

  if (classError || !cls) return null;

  let query = supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("class_id", classId)
    .eq("status", "active");

  if (excludeStudentId) {
    query = query.neq("id", excludeStudentId);
  }

  const { count, error: countError } = await query;

  if (countError) {
    console.error("getClassCapacityInfo count error:", countError);
    return null;
  }

  const studentCount = count ?? 0;
  const capacity = cls.capacity;
  const isFull = capacity != null && studentCount >= capacity;

  return {
    capacity,
    studentCount,
    isFull,
    className: cls.name,
  };
}

/** Block enrollment when class is at capacity unless admin override is allowed. */
export async function assertClassCapacity(
  input: AssertClassCapacityInput
): Promise<{ ok: true } | { error: string }> {
  const info = await getClassCapacityInfo(input.classId, input.excludeStudentId);
  if (!info) return await actionError("classNotFound");

  if (!info.isFull) return { ok: true };

  const mayOverride =
    Boolean(input.override) && canOverrideClassCapacity(input.callerRole);

  if (mayOverride) return { ok: true };

  return await actionError("classAtCapacity", { className: info.className });
}

/** Notify the class main teacher that a student was added to their class. */
export async function notifyClassMainTeacher(input: {
  classId: string;
  studentName: string;
  studentId: string;
}): Promise<void> {
  const supabase = await createClient();

  const { data: cls } = await supabase
    .from("classes")
    .select("main_teacher_id, name")
    .eq("id", input.classId)
    .maybeSingle();

  if (!cls?.main_teacher_id) return;

  const tn = await getTranslations("notifications");
  await createNotification({
    userId: cls.main_teacher_id,
    title: tn("studentAddedToClass"),
    body: tn("studentAddedToClassBody", {
      studentName: input.studentName,
      className: cls.name,
    }),
    url: "/teacher/classes",
    tag: `student-class-${input.studentId}`,
  });
}
