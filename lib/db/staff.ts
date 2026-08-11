import { createClient } from "@/lib/supabase/server";
import { PAYROLL_ADMIN_ROLES, type UserRole } from "@/lib/auth/rbac";

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
  profile_id: string | null;
  is_admin_payee: boolean;
};

export type AdminPayeeListItem = StaffListItem & {
  profile_role: string;
};

function mapStaffRow(member: {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  department: string | null;
  monthly_salary: number | null;
  employment_status: string | null;
  photo_url: string | null;
  branch_id: string | null;
  profile_id?: string | null;
  is_admin_payee?: boolean | null;
  branches?: { name?: string } | null;
}): StaffListItem {
  return {
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
    branch_name: member.branches?.name ?? null,
    profile_id: member.profile_id ?? null,
    is_admin_payee: Boolean(member.is_admin_payee),
  };
}

export async function getStaff(options?: {
  schoolId?: string;
  branchId?: string;
  activeOnly?: boolean;
  includeAdminPayeesOutsideBranch?: boolean;
}): Promise<StaffListItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("staff")
    .select(
      "id, name, email, role, department, monthly_salary, employment_status, photo_url, branch_id, profile_id, is_admin_payee, branches(name)"
    )
    .order("name");

  if (options?.schoolId) {
    query = query.eq("school_id", options.schoolId);
  }
  if (options?.branchId && !options.includeAdminPayeesOutsideBranch) {
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

  let rows = (data ?? []).map((member) =>
    mapStaffRow(member as Parameters<typeof mapStaffRow>[0])
  );

  if (options?.branchId && options.includeAdminPayeesOutsideBranch) {
    rows = rows.filter(
      (row) => row.branch_id === options.branchId || row.is_admin_payee
    );
  }

  return rows;
}

export async function getAdminPayees(schoolId: string): Promise<AdminPayeeListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .select(
      "id, name, email, role, department, monthly_salary, employment_status, photo_url, branch_id, profile_id, is_admin_payee, branches(name)"
    )
    .eq("school_id", schoolId)
    .eq("is_admin_payee", true)
    .eq("employment_status", "active")
    .order("name");

  if (error) {
    console.error("getAdminPayees error:", error);
    return [];
  }

  return (data ?? []).map((member) => ({
    ...mapStaffRow(member as Parameters<typeof mapStaffRow>[0]),
    profile_role: member.role ?? "academic_admin",
  }));
}

export function isPayrollAdminRole(role: string | null | undefined): boolean {
  return PAYROLL_ADMIN_ROLES.includes((role ?? "") as UserRole);
}

export async function getStaffCount(options?: {
  schoolId?: string;
  branchId?: string;
}) {
  const staff = await getStaff(options);
  return staff.length;
}
