import { createClient } from "@/lib/supabase/server";

export type StaffListItem = {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  department: string | null;
  monthly_salary: number;
  employment_status: "active" | "inactive";
  photo_url: string | null;
  branch_id: string | null;
  branch_name: string | null;
};

export async function getStaff(options?: {
  schoolId?: string;
  branchId?: string;
  activeOnly?: boolean;
}): Promise<StaffListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("staff")
    .select(
      "id, name, email, role, department, monthly_salary, employment_status, photo_url, branch_id, branches(name)"
    )
    .order("name");

  if (options?.schoolId) {
    query = query.eq("school_id", options.schoolId);
  }
  if (options?.branchId) {
    query = query.eq("branch_id", options.branchId);
  }
  if (options?.activeOnly) {
    query = query.eq("employment_status", "active");
  }

  const { data, error } = await query;
  if (error) {
    console.error("getStaff error:", error);
    return [];
  }

  return (data ?? []).map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    department: member.department ?? null,
    monthly_salary: Number(member.monthly_salary ?? 0),
    employment_status: (member.employment_status ?? "active") as
      | "active"
      | "inactive",
    photo_url: member.photo_url ?? null,
    branch_id: member.branch_id,
    branch_name: (member.branches as { name?: string } | null)?.name ?? null,
  }));
}

export async function getStaffCount(options?: {
  schoolId?: string;
  branchId?: string;
}) {
  const staff = await getStaff(options);
  return staff.length;
}
