"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/db/staff";
import {
  normalizeRole,
  type UserRole,
} from "@/lib/auth/rbac";
import {
  payrollGenerateSchema,
  payrollPaymentSchema,
  type PayrollGenerateFormData,
  type PayrollPaymentFormData,
} from "@/lib/validations/finance";

const amountSchema = z.object({
  amount: z.coerce.number().min(0, "Amount must be zero or positive"),
});

const ROLE_LABELS: Record<string, string> = {
  academic_admin: "Academic Admin",
  admin_coordinator: "Admin Coordinator",
  registrar: "Registrar",
  admissions_officer: "Admissions Officer",
  pedagogy_coordinator: "Pedagogy Coordinator",
  principal: "Principal",
  teacher: "Teacher",
  finance_officer: "Finance Officer",
  cashier: "Cashier",
  accountant: "Accountant",
  operations_manager: "Operations Manager",
  operations_officer: "Operations Officer",
  discipline_officer: "Discipline Officer",
  supervisor: "Supervisor",
  pedagogical_council_member: "Pedagogical Council Member",
  analytics: "Analytics",
};

function departmentForRole(role: string): string {
  if (role === "teacher" || role === "pedagogy_coordinator" || role === "pedagogical_council_member") {
    return "Teaching";
  }
  if (role === "finance_officer" || role === "accountant" || role === "cashier") {
    return "Finance";
  }
  if (role === "operations_manager" || role === "operations_officer") {
    return "Operations";
  }
  if (role === "discipline_officer" || role === "supervisor") {
    return "Discipline";
  }
  return "Administration";
}

function revalidatePayrollPaths() {
  revalidatePath("/finance/payroll");
  revalidatePath("/finance/reports");
  revalidatePath("/finance");
  revalidatePath("/operations/staff");
}

async function requireFinanceManager() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, school_id, branch_id")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Profile not found" as const };

  const role = normalizeRole(profile.role);
  const canManage =
    role === "super_admin" ||
    role === "finance_officer" ||
    role === "accountant";
  if (!canManage) {
    return { error: "Only finance admins can manage payroll amounts" as const };
  }
  if (!profile.school_id && role !== "super_admin") {
    return { error: "Your account is not linked to a school" as const };
  }

  return { supabase, profile, role };
}

/**
 * Ensure every school team profile (staff of all roles) has a linked staff
 * payee row for payroll. Amounts stay 0 until finance sets them.
 */
export async function syncSchoolTeamPayees(schoolId: string, branchId?: string | null) {
  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  if (
    auth.role !== "super_admin" &&
    auth.profile.school_id &&
    auth.profile.school_id !== schoolId
  ) {
    return { error: "You can only sync staff for your school" };
  }

  const { data: profiles, error: profileError } = await auth.supabase.rpc(
    "list_payroll_team_profiles",
    { p_school_id: schoolId }
  );

  if (profileError) return { error: profileError.message };

  const { data: existing } = await auth.supabase
    .from("staff")
    .select("id, profile_id, monthly_salary")
    .eq("school_id", schoolId)
    .not("profile_id", "is", null);

  const byProfile = new Map(
    (existing ?? [])
      .filter((row) => row.profile_id)
      .map((row) => [row.profile_id as string, row])
  );

  let created = 0;
  let updated = 0;

  for (const profile of profiles ?? []) {
    const role = String(profile.role) as UserRole;
    const label = ROLE_LABELS[role] ?? role.replace(/_/g, " ");
    const department = departmentForRole(role);
    const existingRow = byProfile.get(profile.id);

    if (existingRow) {
      const { error } = await auth.supabase
        .from("staff")
        .update({
          name: profile.name || label,
          role: label,
          department,
          is_admin_payee: true,
          employment_status: "active",
          branch_id: profile.branch_id ?? branchId ?? null,
          photo_url: profile.avatar_url ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRow.id);
      if (error) return { error: error.message };
      updated += 1;
      continue;
    }

    const { error } = await auth.supabase.from("staff").insert({
      school_id: schoolId,
      branch_id: profile.branch_id ?? branchId ?? null,
      name: profile.name || label,
      role: label,
      department,
      profile_id: profile.id,
      is_admin_payee: true,
      monthly_salary: 0,
      employment_status: "active",
      photo_url: profile.avatar_url ?? null,
    });
    if (error) return { error: error.message };
    created += 1;
  }

  // Soft-deactivate profile-linked payees who left the school team.
  const activeProfileIds = new Set((profiles ?? []).map((p) => p.id as string));
  const stale = (existing ?? []).filter(
    (row) => row.profile_id && !activeProfileIds.has(row.profile_id)
  );
  for (const row of stale) {
    await auth.supabase
      .from("staff")
      .update({
        is_admin_payee: false,
        employment_status: "inactive",
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .eq("is_admin_payee", true);
  }

  revalidatePayrollPaths();
  return { data: { created, updated } };
}

/** @deprecated Use syncSchoolTeamPayees */
export async function syncSchoolAdminPayees(
  schoolId: string,
  branchId?: string | null
) {
  return syncSchoolTeamPayees(schoolId, branchId);
}

/** Finance-only: set the monthly amount an admin (or any staff) should be paid. */
export async function setStaffPayrollAmount(staffId: string, amount: number) {
  const parsed = amountSchema.safeParse({ amount });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid amount" };
  }

  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const { data: staff, error: staffError } = await auth.supabase
    .from("staff")
    .select("id, school_id, name")
    .eq("id", staffId)
    .single();

  if (staffError || !staff) return { error: "Staff member not found" };
  if (
    auth.role !== "super_admin" &&
    auth.profile.school_id &&
    staff.school_id !== auth.profile.school_id
  ) {
    return { error: "Staff member is not in your school" };
  }

  const { error } = await auth.supabase
    .from("staff")
    .update({
      monthly_salary: parsed.data.amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", staffId);

  if (error) return { error: error.message };

  // Keep open pending payroll rows in sync with the new amount.
  await auth.supabase
    .from("payroll")
    .update({
      amount: parsed.data.amount,
      staff_monthly_salary: parsed.data.amount,
      updated_at: new Date().toISOString(),
    })
    .eq("staff_id", staffId)
    .eq("status", "pending");

  revalidatePayrollPaths();
  return { data: { staffId, amount: parsed.data.amount } };
}

/** Finance-only: set amount on a pending payroll row before paying. */
export async function setPendingPayrollAmount(payrollId: string, amount: number) {
  const parsed = amountSchema.safeParse({ amount });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid amount" };
  }

  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const { data: row, error: rowError } = await auth.supabase
    .from("payroll")
    .select("id, status, staff_id, staff(school_id)")
    .eq("id", payrollId)
    .single();

  if (rowError || !row) return { error: "Payroll record not found" };
  if (row.status !== "pending") {
    return { error: "Only pending payroll amounts can be edited" };
  }

  const staff = row.staff as { school_id?: string } | null;
  if (
    auth.role !== "super_admin" &&
    auth.profile.school_id &&
    staff?.school_id &&
    staff.school_id !== auth.profile.school_id
  ) {
    return { error: "Payroll record is not in your school" };
  }

  const { error } = await auth.supabase
    .from("payroll")
    .update({
      amount: parsed.data.amount,
      staff_monthly_salary: parsed.data.amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payrollId)
    .eq("status", "pending");

  if (error) return { error: error.message };

  if (row.staff_id) {
    await auth.supabase
      .from("staff")
      .update({
        monthly_salary: parsed.data.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.staff_id);
  }

  revalidatePayrollPaths();
  return {};
}

export async function deletePayroll(id: string) {
  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const { error } = await auth.supabase.from("payroll").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePayrollPaths();
  return {};
}

const monthInclusionSchema = z.object({
  staffId: z.string().uuid(),
  schoolId: z.string().uuid(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  included: z.boolean(),
});

/**
 * Tick someone in/out of a specific payroll month.
 * Excluding removes any pending payroll line for that month; including adds
 * them back if the month already has a generated run.
 */
export async function setStaffPayrollMonthInclusion(input: {
  staffId: string;
  schoolId: string;
  month: number;
  year: number;
  included: boolean;
}) {
  const parsed = monthInclusionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  if (
    auth.role !== "super_admin" &&
    auth.profile.school_id &&
    auth.profile.school_id !== parsed.data.schoolId
  ) {
    return { error: "You can only manage payroll for your school" };
  }

  const { data: staff, error: staffError } = await auth.supabase
    .from("staff")
    .select("id, school_id, name, role, department, monthly_salary, employment_status, photo_url")
    .eq("id", parsed.data.staffId)
    .single();

  if (staffError || !staff) return { error: "Staff member not found" };
  if (staff.school_id !== parsed.data.schoolId) {
    return { error: "Staff member is not in this school" };
  }

  if (!parsed.data.included) {
    const { data: existingLine } = await auth.supabase
      .from("payroll")
      .select("id, status")
      .eq("staff_id", parsed.data.staffId)
      .eq("payroll_month", parsed.data.month)
      .eq("payroll_year", parsed.data.year)
      .maybeSingle();

    if (existingLine?.status === "paid") {
      return {
        error: "This person is already paid for this month. Undo payment before excluding them.",
      };
    }

    const { error: exclusionError } = await auth.supabase
      .from("payroll_exclusions")
      .upsert(
        {
          school_id: parsed.data.schoolId,
          staff_id: parsed.data.staffId,
          payroll_month: parsed.data.month,
          payroll_year: parsed.data.year,
          created_by: auth.profile.id,
        },
        { onConflict: "staff_id,payroll_year,payroll_month" }
      );

    if (exclusionError) return { error: exclusionError.message };

    if (existingLine?.id) {
      const { error: deleteError } = await auth.supabase
        .from("payroll")
        .delete()
        .eq("id", existingLine.id)
        .eq("status", "pending");
      if (deleteError) return { error: deleteError.message };
    }

    revalidatePayrollPaths();
    return { data: { included: false } };
  }

  const { error: clearError } = await auth.supabase
    .from("payroll_exclusions")
    .delete()
    .eq("staff_id", parsed.data.staffId)
    .eq("payroll_month", parsed.data.month)
    .eq("payroll_year", parsed.data.year);

  if (clearError) return { error: clearError.message };

  // If this month already has payroll lines for the school, add this person back.
  const { data: periodPeers } = await auth.supabase
    .from("payroll")
    .select("id, staff(school_id)")
    .eq("payroll_month", parsed.data.month)
    .eq("payroll_year", parsed.data.year)
    .limit(50);

  const periodExists = (periodPeers ?? []).some((row) => {
    const peerStaff = row.staff as { school_id?: string } | null;
    return peerStaff?.school_id === parsed.data.schoolId;
  });

  if (periodExists) {
    const { data: alreadyThere } = await auth.supabase
      .from("payroll")
      .select("id")
      .eq("staff_id", parsed.data.staffId)
      .eq("payroll_month", parsed.data.month)
      .eq("payroll_year", parsed.data.year)
      .maybeSingle();

    if (!alreadyThere) {
      const periodStart = new Date(
        Date.UTC(parsed.data.year, parsed.data.month - 1, 1)
      );
      const periodEnd = new Date(Date.UTC(parsed.data.year, parsed.data.month, 0));
      const { error: insertError } = await auth.supabase.from("payroll").insert({
        staff_id: staff.id,
        payroll_month: parsed.data.month,
        payroll_year: parsed.data.year,
        period_start: periodStart.toISOString().slice(0, 10),
        period_end: periodEnd.toISOString().slice(0, 10),
        amount: staff.monthly_salary,
        status: "pending" as const,
        payment_date: null,
        payment_method: null,
        reference_number: null,
        notes: null,
        staff_full_name: staff.name,
        staff_position: staff.role,
        staff_department: staff.department,
        staff_monthly_salary: staff.monthly_salary,
        staff_employment_status: staff.employment_status,
        staff_photo_url: staff.photo_url,
      });
      if (insertError) return { error: insertError.message };
    }
  }

  revalidatePayrollPaths();
  return { data: { included: true } };
}

export async function generatePayroll(
  input: PayrollGenerateFormData & { schoolId?: string; branchId?: string }
) {
  const parsed = payrollGenerateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const schoolId = input.schoolId ?? auth.profile.school_id ?? undefined;
  if (!schoolId) {
    return { error: "School is required to generate payroll" };
  }

  const sync = await syncSchoolTeamPayees(schoolId, input.branchId ?? auth.profile.branch_id);
  if (sync.error) return { error: sync.error };

  const staff = await getStaff({
    schoolId,
    activeOnly: true,
  });

  if (staff.length === 0) {
    return { error: "No active staff found for payroll generation" };
  }

  const { data: exclusions } = await auth.supabase
    .from("payroll_exclusions")
    .select("staff_id")
    .eq("school_id", schoolId)
    .eq("payroll_month", parsed.data.month)
    .eq("payroll_year", parsed.data.year);

  const excludedIds = new Set((exclusions ?? []).map((row) => row.staff_id as string));
  const payees = staff.filter((member) => !excludedIds.has(member.id));

  if (payees.length === 0) {
    return {
      error:
        "Everyone is ticked out for this month. Include at least one person before generating payroll.",
    };
  }

  const { data: existing } = await auth.supabase
    .from("payroll")
    .select("id, staff(school_id)")
    .eq("payroll_month", parsed.data.month)
    .eq("payroll_year", parsed.data.year);

  const alreadyGenerated = (existing ?? []).some((row) => {
    const rowStaff = row.staff as { school_id?: string } | null;
    return rowStaff?.school_id === schoolId;
  });

  if (alreadyGenerated) {
    return {
      error: `Payroll for ${new Date(
        Date.UTC(parsed.data.year, parsed.data.month - 1, 1)
      ).toLocaleDateString(undefined, { month: "long", year: "numeric" })} has already been generated.`,
    };
  }

  const periodStart = new Date(Date.UTC(parsed.data.year, parsed.data.month - 1, 1));
  const periodEnd = new Date(Date.UTC(parsed.data.year, parsed.data.month, 0));

  const { error } = await auth.supabase.from("payroll").insert(
    payees.map((member) => ({
      staff_id: member.id,
      payroll_month: parsed.data.month,
      payroll_year: parsed.data.year,
      period_start: periodStart.toISOString().slice(0, 10),
      period_end: periodEnd.toISOString().slice(0, 10),
      amount: member.monthly_salary,
      status: "pending" as const,
      payment_date: null,
      payment_method: null,
      reference_number: null,
      notes: null,
      staff_full_name: member.name,
      staff_position: member.role,
      staff_department: member.department,
      staff_monthly_salary: member.monthly_salary,
      staff_employment_status: member.employment_status,
      staff_photo_url: member.photo_url,
    }))
  );

  if (error) return { error: error.message };

  revalidatePayrollPaths();
  return {
    data: {
      created: payees.length,
      skipped: excludedIds.size,
    },
  };
}

export async function markPayrollPaid(
  id: string,
  input: PayrollPaymentFormData
) {
  const parsed = payrollPaymentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const { data: payrollRow, error: payrollError } = await auth.supabase
    .from("payroll")
    .select(
      "id, staff_id, status, payroll_month, payroll_year, staff_full_name, staff_position, staff(name, branch_id)"
    )
    .eq("id", id)
    .single();

  if (payrollError || !payrollRow) return { error: "Payroll record not found" };
  if (payrollRow.status === "paid") {
    return { error: "Payroll has already been marked as paid" };
  }

  const { error } = await auth.supabase
    .from("payroll")
    .update({
      status: "paid",
      amount: parsed.data.amount,
      payment_date: parsed.data.payment_date,
      payment_method: parsed.data.payment_method,
      reference_number: parsed.data.reference_number || null,
      notes: parsed.data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  const rowStaff = payrollRow.staff as { branch_id?: string | null } | null;
  let branchId = rowStaff?.branch_id ?? auth.profile.branch_id ?? null;

  if (branchId) {
    const periodLabel = new Date(
      Date.UTC(payrollRow.payroll_year, payrollRow.payroll_month - 1, 1)
    ).toLocaleDateString(undefined, { month: "long", year: "numeric" });
    await auth.supabase.from("expenses").insert({
      branch_id: branchId,
      category: "Payroll",
      amount: parsed.data.amount,
      date: parsed.data.payment_date,
      description: `Payroll paid: ${payrollRow.staff_full_name} (${payrollRow.staff_position ?? "Staff"}) - ${periodLabel}`,
      status: "pending",
      created_by: auth.profile.id,
    });
  }

  revalidatePayrollPaths();
  revalidatePath("/academic/tasks");
  return {};
}

export async function deletePayrollPeriod(input: {
  month: number;
  year: number;
  schoolId?: string;
  branchId?: string;
}) {
  const parsed = payrollGenerateSchema.safeParse({
    month: input.month,
    year: input.year,
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const { data, error } = await auth.supabase
    .from("payroll")
    .select("id, staff(school_id, branch_id, is_admin_payee)")
    .eq("payroll_month", parsed.data.month)
    .eq("payroll_year", parsed.data.year);

  if (error) return { error: error.message };

  const toDelete = (data ?? [])
    .filter((row) => {
      const staff = row.staff as {
        school_id?: string;
        branch_id?: string | null;
        is_admin_payee?: boolean;
      } | null;
      if (input.schoolId && staff?.school_id !== input.schoolId) return false;
      if (
        input.branchId &&
        staff?.branch_id !== input.branchId &&
        !staff?.is_admin_payee
      ) {
        return false;
      }
      return true;
    })
    .map((row) => row.id);

  if (toDelete.length === 0) return { error: "No payroll records found for this month" };

  const { error: deleteError } = await auth.supabase
    .from("payroll")
    .delete()
    .in("id", toDelete);
  if (deleteError) return { error: deleteError.message };

  revalidatePayrollPaths();
  return { data: { deleted: toDelete.length } };
}
