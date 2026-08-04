import { createClient } from "@/lib/supabase/server";

export type SchoolTask = {
  id: string;
  title: string;
  description: string | null;
  department: string;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  assigned_to: string | null;
  assigned_name: string | null;
  created_by: string | null;
  created_at: string;
};

export type DisciplineIncident = {
  id: string;
  title: string;
  description: string | null;
  severity: "low" | "medium" | "high";
  status: "open" | "monitoring" | "resolved" | "escalated";
  incident_date: string;
  student_id: string | null;
  student_name: string | null;
  reported_by: string | null;
  assigned_to: string | null;
  created_at: string;
};

export async function getSchoolTaskStats(schoolId?: string) {
  if (!schoolId) return { openTasks: 0, overdueTasks: 0 };

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [openResult, overdueResult] = await Promise.all([
    supabase
      .from("school_tasks")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .neq("status", "done"),
    supabase
      .from("school_tasks")
      .select("id", { count: "exact", head: true })
      .eq("school_id", schoolId)
      .neq("status", "done")
      .lt("due_date", today),
  ]);

  return {
    openTasks: openResult.count ?? 0,
    overdueTasks: overdueResult.count ?? 0,
  };
}

export async function getDisciplineStats(schoolId?: string) {
  if (!schoolId) return { openIncidents: 0 };

  const supabase = await createClient();
  const { count } = await supabase
    .from("discipline_incidents")
    .select("id", { count: "exact", head: true })
    .eq("school_id", schoolId)
    .in("status", ["open", "monitoring", "escalated"]);

  return { openIncidents: count ?? 0 };
}

export async function getSchoolTasks(schoolId: string): Promise<SchoolTask[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("school_tasks")
    .select(`
      id, title, description, department, status, priority, due_date,
      assigned_to, created_by, created_at,
      profiles:assigned_to(name)
    `)
    .eq("school_id", schoolId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getSchoolTasks error:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const profile = row.profiles as { name?: string } | null;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      department: row.department,
      status: row.status,
      priority: row.priority,
      due_date: row.due_date,
      assigned_to: row.assigned_to,
      assigned_name: profile?.name ?? null,
      created_by: row.created_by,
      created_at: row.created_at,
    };
  });
}

export async function getDisciplineIncidents(
  schoolId: string
): Promise<DisciplineIncident[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("discipline_incidents")
    .select(`
      id, title, description, severity, status, incident_date,
      student_id, reported_by, assigned_to, created_at,
      students(first_name, last_name)
    `)
    .eq("school_id", schoolId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getDisciplineIncidents error:", error);
    return [];
  }

  return (data ?? []).map((row) => {
    const student = row.students as { first_name?: string; last_name?: string } | null;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      severity: row.severity,
      status: row.status,
      incident_date: row.incident_date,
      student_id: row.student_id,
      student_name: student
        ? `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim()
        : null,
      reported_by: row.reported_by,
      assigned_to: row.assigned_to,
      created_at: row.created_at,
    };
  });
}
