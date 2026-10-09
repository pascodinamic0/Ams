import { keepRecognizedStudents } from "@/lib/students/recognized";
import { createClient } from "@/lib/supabase/server";
import { formatPersonName, formatStudentName } from "@/lib/utils";

export type StudentPortalProfile = {
  id: string;
  student_id: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  name: string;
  class_id: string | null;
  class_name: string | null;
  branch_id: string;
  school_id: string;
  status: string;
};

export async function getStudentByAuthUserId(
  authUserId: string
): Promise<StudentPortalProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select(`
      id,
      student_id,
      first_name,
      middle_name,
      last_name,
      class_id,
      branch_id,
      school_id,
      status,
      classes(name)
    `)
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getStudentByAuthUserId error:", error);
    return null;
  }

  return {
    id: data.id,
    student_id: data.student_id,
    first_name: data.first_name,
    middle_name: data.middle_name ?? null,
    last_name: data.last_name,
    name: formatStudentName(data),
    class_id: data.class_id,
    class_name: (data.classes as { name?: string } | null)?.name ?? null,
    branch_id: data.branch_id,
    school_id: data.school_id,
    status: data.status ?? "active",
  };
}

export type StudentListItem = {
  id: string;
  student_id: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  name: string;
  photo_url: string | null;
  class_id: string | null;
  class_name: string | null;
  guardian_name: string | null;
  status: string;
  tags: string[];
};

const STUDENT_LIST_COLUMNS = `
      id,
      student_id,
      first_name,
      middle_name,
      last_name,
      photo_url,
      status,
      tags,
      class_id,
      father_name,
      classes(name),
      guardian_students(guardians(name))
    `;

type StudentListScope = {
  classId?: string;
  status?: string;
  tag?: string;
  branchId?: string;
  schoolId?: string;
  recognized?: boolean;
};

type StudentListRow = {
  id: string;
  student_id: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  photo_url: string | null;
  status: string | null;
  tags: string[] | null;
  class_id: string | null;
  father_name: string | null;
  classes: { name?: string } | { name?: string }[] | null;
  guardian_students: Array<{ guardians: { name?: string } | null }> | null;
};

interface StudentListFilter {
  eq(column: string, value: string): StudentListFilter;
  in(column: string, values: string[]): StudentListFilter;
  contains(column: string, value: string[]): StudentListFilter;
}

function withStudentListScope<T>(query: T, options?: StudentListScope): T {
  let scoped = query as unknown as StudentListFilter;
  if (options?.branchId) scoped = scoped.eq("branch_id", options.branchId);
  if (options?.schoolId) scoped = scoped.eq("school_id", options.schoolId);
  if (options?.classId) scoped = scoped.eq("class_id", options.classId);
  if (options?.recognized) scoped = scoped.in("status", ["active", "pending"]);
  else if (options?.status) scoped = scoped.eq("status", options.status);
  if (options?.tag) scoped = scoped.contains("tags", [options.tag]);
  return scoped as T;
}

function mapStudentListRow(s: StudentListRow): StudentListItem {
  const linkedGuardian = s.guardian_students?.[0]?.guardians?.name?.trim();
  const fatherName = s.father_name?.trim();
  const classes = Array.isArray(s.classes) ? s.classes[0] : s.classes;
  return {
    id: s.id,
    student_id: s.student_id,
    first_name: s.first_name,
    middle_name: s.middle_name ?? null,
    last_name: s.last_name,
    name: formatStudentName(s),
    photo_url: s.photo_url ?? null,
    class_id: s.class_id,
    class_name: classes?.name ?? null,
    guardian_name: linkedGuardian || fatherName || null,
    status: s.status ?? "active",
    tags: Array.isArray(s.tags) ? s.tags : [],
  };
}

function sanitizeStudentSearch(raw: string | undefined): string {
  return (raw ?? "")
    .trim()
    .replace(/[%_,.()"\\]/g, "")
    .slice(0, 80);
}

export async function getStudents(options?: {
  search?: string;
  classId?: string;
  status?: string;
  tag?: string;
  branchId?: string;
  schoolId?: string;
  /** Activated students, plus pending students who have paid. */
  recognized?: boolean;
}): Promise<StudentListItem[]> {
  const supabase = await createClient();
  const search = sanitizeStudentSearch(options?.search);

  if (!search) {
    const { data, error } = await withStudentListScope(
      supabase
        .from("students")
        .select(STUDENT_LIST_COLUMNS)
        .order("created_at", { ascending: false }),
      options
    );

    if (error) {
      console.error("getStudents error:", error);
      return [];
    }

    const rows = ((data ?? []) as unknown as StudentListRow[]).map(mapStudentListRow);
    return options?.recognized ? keepRecognizedStudents(supabase, rows) : rows;
  }

  const primary = search.split(/\s+/).find(Boolean) ?? search;
  const pattern = `%${primary}%`;
  const identityFilters = [
    `first_name.ilike.${pattern}`,
    `middle_name.ilike.${pattern}`,
    `last_name.ilike.${pattern}`,
    `student_id.ilike.${pattern}`,
  ];
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search)) {
    identityFilters.unshift(`id.eq.${search}`);
  }

  const byIdentity = withStudentListScope(
    supabase
      .from("students")
      .select(STUDENT_LIST_COLUMNS)
      .or(identityFilters.join(","))
      .order("created_at", { ascending: false }),
    options
  );
  const byClass = withStudentListScope(
    supabase
      .from("students")
      .select(`
      id,
      student_id,
      first_name,
      middle_name,
      last_name,
      photo_url,
      status,
      tags,
      class_id,
      father_name,
      classes!inner(name),
      guardian_students(guardians(name))
    `)
      .ilike("classes.name", `%${search}%`)
      .order("created_at", { ascending: false }),
    options
  );

  const [nameResult, classResult] = await Promise.all([byIdentity, byClass]);
  if (nameResult.error) console.error("getStudents name search error:", nameResult.error);
  if (classResult.error) console.error("getStudents class search error:", classResult.error);

  const seen = new Set<string>();
  const matches: StudentListItem[] = [];
  for (const row of [
    ...((nameResult.data ?? []) as unknown as StudentListRow[]),
    ...((classResult.data ?? []) as unknown as StudentListRow[]),
  ]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    const student = mapStudentListRow(row);
    if (!matchesStudentSearch(student, search)) continue;
    matches.push(student);
  }

  return options?.recognized ? keepRecognizedStudents(supabase, matches) : matches;
}

function matchesStudentSearch(
  student: Pick<
    StudentListItem,
    | "id"
    | "student_id"
    | "name"
    | "first_name"
    | "middle_name"
    | "last_name"
    | "class_name"
  >,
  raw: string | undefined
): boolean {
  const needle = (raw ?? "").trim().toLowerCase();
  if (!needle) return true;

  const fields = [
    student.id,
    student.student_id,
    student.name,
    student.first_name,
    student.middle_name,
    student.last_name,
    student.class_name,
  ]
    .filter((part): part is string => Boolean(part))
    .map((part) => part.toLowerCase());

  if (fields.some((field) => field.includes(needle))) return true;

  const tokens = needle.split(/\s+/).filter((token) => token.length >= 2);
  if (tokens.length < 2) return false;
  const haystack = fields.join(" ");
  return tokens.every((token) => haystack.includes(token));
}

/** Lean student list for finance invoicing (school-wide, no guardian join). */
export type BillingStudentOption = {
  id: string;
  student_id: string | null;
  name: string;
  class_id: string | null;
  class_name: string | null;
  status: string;
};

export async function getStudentsForBilling(options?: {
  schoolId?: string;
  classId?: string;
  status?: string;
  recognized?: boolean;
}): Promise<BillingStudentOption[]> {
  const supabase = await createClient();
  let query = supabase
    .from("students")
    .select(`
      id,
      student_id,
      first_name,
      middle_name,
      last_name,
      status,
      class_id,
      classes(name)
    `)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (options?.schoolId) {
    query = query.eq("school_id", options.schoolId);
  }
  if (options?.classId) {
    query = query.eq("class_id", options.classId);
  }
  if (options?.recognized) {
    query = query.in("status", ["active", "pending"]);
  } else if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getStudentsForBilling error:", error);
    return [];
  }

  const rows = (data ?? []).map((s) => ({
    id: s.id,
    student_id: s.student_id,
    name: formatPersonName(s),
    class_id: s.class_id,
    class_name: (s.classes as { name?: string } | null)?.name ?? null,
    status: s.status ?? "active",
  }));
  return options?.recognized ? keepRecognizedStudents(supabase, rows) : rows;
}

type BillingStudentRow = {
  id: string;
  student_id: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  status: string | null;
  class_id: string | null;
  classes: { name?: string } | { name?: string }[] | null;
};

function mapBillingStudent(s: BillingStudentRow): BillingStudentOption {
  const classes = Array.isArray(s.classes) ? s.classes[0] : s.classes;
  return {
    id: s.id,
    student_id: s.student_id,
    name: formatPersonName(s),
    class_id: s.class_id,
    class_name: classes?.name ?? null,
    status: s.status ?? "active",
  };
}

/** Name, ID, or class lookup for the invoice student field. Not limited to active students. */
export async function searchStudentsForBilling(options: {
  schoolId?: string;
  search: string;
  limit?: number;
}): Promise<BillingStudentOption[]> {
  const cleaned = options.search.trim().replace(/[%_,]/g, "");
  const tokens = cleaned.split(/\s+/).filter(Boolean).slice(0, 4);
  const primary = tokens[0];
  if (!primary) return [];

  const supabase = await createClient();
  const limit = options.limit ?? 8;
  const fields =
    "id, student_id, first_name, middle_name, last_name, status, class_id, classes(name)";
  const pattern = `%${primary}%`;

  let byName = supabase
    .from("students")
    .select(fields)
    .or(
      `first_name.ilike.${pattern},middle_name.ilike.${pattern},last_name.ilike.${pattern},student_id.ilike.${pattern}`
    )
    .limit(40);
  let byClass = supabase
    .from("students")
    .select(
      "id, student_id, first_name, middle_name, last_name, status, class_id, classes!inner(name)"
    )
    .ilike("classes.name", `%${cleaned}%`)
    .limit(20);

  if (options.schoolId) {
    byName = byName.eq("school_id", options.schoolId);
    byClass = byClass.eq("school_id", options.schoolId);
  }

  const [nameResult, classResult] = await Promise.all([byName, byClass]);
  if (nameResult.error) console.error("searchStudentsForBilling name error:", nameResult.error);
  if (classResult.error) console.error("searchStudentsForBilling class error:", classResult.error);

  const rows = [
    ...((nameResult.data ?? []) as BillingStudentRow[]),
    ...((classResult.data ?? []) as BillingStudentRow[]),
  ];
  const seen = new Set<string>();
  const matches: BillingStudentOption[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    const student = mapBillingStudent(row);
    const haystack = `${student.name} ${student.student_id ?? ""} ${student.class_name ?? ""}`.toLowerCase();
    if (!tokens.every((token) => haystack.includes(token.toLowerCase()))) continue;
    matches.push(student);
  }

  matches.sort((a, b) => a.name.localeCompare(b.name));
  return matches.slice(0, limit);
}

export async function getStudentById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select(
      `
      *,
      classes(name, grade),
      guardian_students(
        can_pickup,
        guardians(id, name, first_name, middle_name, last_name, email, phone, relation, address, workplace)
      ),
      student_pickup_persons(id, full_name, phone, relationship, notes)
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error) console.error("getStudentById error:", error);
    return null;
  }
  return data;
}

export type StudentInscriptionExportRow = {
  student_id: string | null;
  school_year: number | null;
  last_name: string;
  middle_name: string | null;
  first_name: string;
  gender: string | null;
  date_of_birth: string | null;
  place_of_birth: string | null;
  previous_school: string | null;
  class_name: string | null;
  father_name: string | null;
  mother_name: string | null;
  responsible_profession: string | null;
  address_number: string | null;
  address_avenue: string | null;
  address_quartier: string | null;
  address_commune: string | null;
  home_address: string | null;
  contact_phone: string | null;
  chronic_illness: boolean | null;
  visual_problem: boolean | null;
  physical_problem: boolean | null;
  allergies: string | null;
  difficulties: string | null;
  notes: string | null;
  status: string;
};

/** Full fiche d'inscription fields for CSV extract. */
export async function getStudentsForInscriptionExport(options?: {
  schoolId?: string;
  branchId?: string;
  status?: string;
}): Promise<StudentInscriptionExportRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("students")
    .select(
      `
      student_id,
      school_year,
      last_name,
      middle_name,
      first_name,
      gender,
      date_of_birth,
      place_of_birth,
      previous_school,
      father_name,
      mother_name,
      responsible_profession,
      address_number,
      address_avenue,
      address_quartier,
      address_commune,
      home_address,
      contact_phone,
      chronic_illness,
      visual_problem,
      physical_problem,
      allergies,
      difficulties,
      notes,
      status,
      classes(name)
    `
    )
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (options?.schoolId) query = query.eq("school_id", options.schoolId);
  if (options?.branchId) query = query.eq("branch_id", options.branchId);
  if (options?.status) query = query.eq("status", options.status);

  const { data, error } = await query;
  if (error) {
    console.error("getStudentsForInscriptionExport error:", error);
    return [];
  }

  return (data ?? []).map((s) => ({
    student_id: s.student_id,
    school_year: s.school_year ?? null,
    last_name: s.last_name,
    middle_name: s.middle_name ?? null,
    first_name: s.first_name,
    gender: s.gender ?? null,
    date_of_birth: s.date_of_birth ?? null,
    place_of_birth: s.place_of_birth ?? null,
    previous_school: s.previous_school ?? null,
    class_name: (s.classes as { name?: string } | null)?.name ?? null,
    father_name: s.father_name ?? null,
    mother_name: s.mother_name ?? null,
    responsible_profession: s.responsible_profession ?? null,
    address_number: s.address_number ?? null,
    address_avenue: s.address_avenue ?? null,
    address_quartier: s.address_quartier ?? null,
    address_commune: s.address_commune ?? null,
    home_address: s.home_address ?? null,
    contact_phone: s.contact_phone ?? null,
    chronic_illness: s.chronic_illness ?? null,
    visual_problem: s.visual_problem ?? null,
    physical_problem: s.physical_problem ?? null,
    allergies: s.allergies ?? null,
    difficulties: s.difficulties ?? null,
    notes: s.notes ?? null,
    status: s.status ?? "active",
  }));
}
