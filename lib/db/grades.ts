import { createClient } from "@/lib/supabase/server";
import { formatPersonName } from "@/lib/utils";

export type StudentGradeItem = {
  id: string;
  subject_name: string;
  school_year: number;
  term: string;
  marks: number | null;
  grade: string | null;
};

export type GradeGridItem = {
  id: string | null;
  student_id: string;
  student_name: string;
  student_number: string | null;
  subject_id: string;
  subject_name: string;
  class_id: string;
  school_year: number;
  term: string;
  marks: number | null;
  grade: string | null;
};

export type ReportCardGrade = {
  subject_name: string;
  school_year: number;
  term: string;
  marks: number | null;
  grade: string | null;
};

export type GradeListItem = StudentGradeItem;

export async function getGradesForStudent(studentId: string): Promise<StudentGradeItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grades")
    .select("id, school_year, term, marks, grade, subjects(name)")
    .eq("student_id", studentId)
    .order("school_year", { ascending: false })
    .order("term");

  if (error) {
    console.error("getGradesForStudent error:", error);
    return [];
  }

  return (data ?? []).map((g) => ({
    id: g.id,
    subject_name: (g.subjects as { name?: string } | null)?.name ?? "Subject",
    school_year: Number(g.school_year),
    term: g.term,
    marks: g.marks !== null ? Number(g.marks) : null,
    grade: g.grade,
  }));
}

export async function getGradesForClass(options: {
  classId: string;
  subjectId?: string;
  schoolYear?: number;
  term?: string;
}): Promise<GradeGridItem[]> {
  const supabase = await createClient();

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, first_name, middle_name, last_name, student_id, class_id")
    .eq("class_id", options.classId)
    .eq("status", "active")
    .order("last_name");

  if (studentsError) {
    console.error("getGradesForClass students error:", studentsError);
    return [];
  }

  if (!students?.length) return [];

  if (!options.subjectId || !options.term || options.schoolYear == null) {
    let query = supabase
      .from("grades")
      .select(
        "id, student_id, subject_id, class_id, school_year, term, marks, grade, subjects(name)"
      )
      .eq("class_id", options.classId);

    if (options.schoolYear != null) {
      query = query.eq("school_year", options.schoolYear);
    }

    const { data: grades, error: gradesError } = await query;

    if (gradesError) {
      console.error("getGradesForClass grades error:", gradesError);
      return [];
    }

    return (grades ?? []).map((g) => {
      const student = students.find((s) => s.id === g.student_id);
      return {
        id: g.id,
        student_id: g.student_id,
        student_name: student ? formatPersonName(student) : "Unknown",
        student_number: student?.student_id ?? null,
        subject_id: g.subject_id,
        subject_name: (g.subjects as { name?: string } | null)?.name ?? "Subject",
        class_id: g.class_id,
        school_year: Number(g.school_year),
        term: g.term,
        marks: g.marks !== null ? Number(g.marks) : null,
        grade: g.grade,
      };
    });
  }

  const { data: grades, error: gradesError } = await supabase
    .from("grades")
    .select(
      "id, student_id, subject_id, class_id, school_year, term, marks, grade, subjects(name)"
    )
    .eq("class_id", options.classId)
    .eq("subject_id", options.subjectId)
    .eq("school_year", options.schoolYear)
    .eq("term", options.term);

  if (gradesError) {
    console.error("getGradesForClass grades error:", gradesError);
  }

  const gradeMap = new Map(
    (grades ?? []).map((g) => [
      g.student_id,
      {
        id: g.id,
        marks: g.marks !== null ? Number(g.marks) : null,
        grade: g.grade,
        subject_name: (g.subjects as { name?: string } | null)?.name ?? "Subject",
      },
    ])
  );

  return students.map((s) => {
    const existing = gradeMap.get(s.id);
    return {
      id: existing?.id ?? null,
      student_id: s.id,
      student_name: formatPersonName(s),
      student_number: s.student_id,
      subject_id: options.subjectId!,
      subject_name: existing?.subject_name ?? "Subject",
      class_id: options.classId,
      school_year: options.schoolYear!,
      term: options.term!,
      marks: existing?.marks ?? null,
      grade: existing?.grade ?? null,
    };
  });
}

export async function getGradesForReportCard(
  studentId: string,
  term: string,
  schoolYear?: number
): Promise<ReportCardGrade[]> {
  const supabase = await createClient();

  let query = supabase
    .from("grades")
    .select("school_year, term, marks, grade, subjects(name)")
    .eq("student_id", studentId)
    .eq("term", term)
    .order("term");

  if (schoolYear != null) {
    query = query.eq("school_year", schoolYear);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getGradesForReportCard error:", error);
    return [];
  }

  return (data ?? []).map((g) => ({
    subject_name: (g.subjects as { name?: string } | null)?.name ?? "Subject",
    school_year: Number(g.school_year),
    term: g.term,
    marks: g.marks !== null ? Number(g.marks) : null,
    grade: g.grade,
  }));
}
