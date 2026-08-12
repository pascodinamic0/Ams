"use server";

import { getLocale, getTranslations } from "next-intl/server";
import { actionError, zodIssueError } from "@/lib/i18n/action-error";

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
  amount: z.coerce.number().min(0, "amountZeroOrPositive"),
});

async function roleLabel(role: string): Promise<string> {
  const t = await getTranslations("roles");
  return t.has(role) ? t(role) : role.replace(/_/g, " ");
}

async function departmentForRole(role: string): Promise<string> {
  const t = await getTranslations("roles");
  if (role === "teacher" || role === "pedagogy_coordinator" || role === "pedagogical_council_member") {
    return t("deptTeaching");
  }
  if (role === "finance_officer" || role === "accountant" || role === "cashier") {
    return t("deptFinance");
  }
  if (role === "operations_manager" || role === "operations_officer") {
    return t("deptOperations");
  }
  if (role === "discipline_officer" || role === "supervisor") {
    return t("deptDiscipline");
  }
  return t("deptAdministration");
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
  if (!user) return await actionError("notAuthenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, school_id, branch_id")
    .eq("id", user.id)
    .single();

  if (!profile) return await actionError("profileNotFound");

  const role = normalizeRole(profile.role);
  const canManage =
    role === "super_admin" ||
    role === "finance_officer" ||
    role === "accountant";
  if (!canManage) {
    return await actionError("onlyFinancePayroll");
  }
  if (!profile.school_id && role !== "super_admin") {
    return await actionError("noSchoolLinked");
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
    return await actionError("onlyOwnSchoolStaffSync");
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
    const label = await roleLabel(role);
    const department = await departmentForRole(role);
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
  const activeProfileIds = new Set(
    (profiles ?? []).map((p: { id: string }) => p.id)
  );
  const stale = (existing ?? []).filter(
    (row: { id: string; profile_id: string | null }) =>
      row.profile_id && !activeProfileIds.has(row.profile_id)
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
    return await zodIssueError(parsed.error.issues[0]?.message);
  }

  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const { data: staff, error: staffError } = await auth.supabase
    .from("staff")
    .select("id, school_id, name")
    .eq("id", staffId)
    .single();

  if (staffError || !staff) return await actionError("staffNotFound");
  if (
    auth.role !== "super_admin" &&
    auth.profile.school_id &&
    staff.school_id !== auth.profile.school_id
  ) {
    return await actionError("staffNotInSchool");
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
    return await zodIssueError(parsed.error.issues[0]?.message);
  }

  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  const { data: row, error: rowError } = await auth.supabase
    .from("payroll")
    .select("id, status, staff_id, staff(school_id)")
    .eq("id", payrollId)
    .single();

  if (rowError || !row) return await actionError("payrollNotFound");
  if (row.status !== "pending") {
    return await actionError("onlyPendingPayrollEdit");
  }

  const staff = row.staff as { school_id?: string } | null;
  if (
    auth.role !== "super_admin" &&
    auth.profile.school_id &&
    staff?.school_id &&
    staff.school_id !== auth.profile.school_id
  ) {
    return await actionError("payrollNotInSchool");
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
    return await zodIssueError(parsed.error.issues[0]?.message);
  }

  const auth = await requireFinanceManager();
  if ("error" in auth) return { error: auth.error };

  if (
    auth.role !== "super_admin" &&
    auth.profile.school_id &&
    auth.profile.school_id !== parsed.data.schoolId
  ) {
    return await actionError("onlyOwnSchoolPayroll");
  }

  const { data: staff, error: staffError } = await auth.supabase
    .from("staff")
    .select("id, school_id, name, role, department, monthly_salary, employment_status, photo_url")
    .eq("id", parsed.data.staffId)
    .single();

  if (staffError || !staff) return await actionError("staffNotFound");
  if (staff.school_id !== parsed.data.schoolId) {
    return await actionError("staffNotInThisSchool");
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
        error: (await actionError("alreadyPaidUndoFirst")).error,
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
    return await actionError("schoolRequiredGeneratePayroll");
  }

  const sync = await syncSchoolTeamPayees(schoolId, input.branchId ?? auth.profile.branch_id);
  if (sync.error) return { error: sync.error };

  const staff = await getStaff({
    schoolId,
    activeOnly: true,
  });

  if (staff.length === 0) {
    return await actionError("noActiveStaffPayroll");
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
    return await actionError("everyoneTickedOut");
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
    const te = await getTranslations("errors");
    const locale = await getLocale();
    const period = new Date(
      Date.UTC(parsed.data.year, parsed.data.month - 1, 1)
    ).toLocaleDateString(locale, { month: "long", year: "numeric" });
    return { error: te("payrollAlreadyGenerated", { period }) };
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

  if (payrollError || !payrollRow) return await actionError("payrollNotFound");
  if (payrollRow.status === "paid") {
    return await actionError("payrollAlreadyPaid");
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
    const locale = await getLocale();
    const periodLabel = new Date(
      Date.UTC(payrollRow.payroll_year, payrollRow.payroll_month - 1, 1)
    ).toLocaleDateString(locale, { month: "long", year: "numeric" });
    const te = await getTranslations("errors");
    await auth.supabase.from("expenses").insert({
      branch_id: branchId,
      category: "Payroll",
      amount: parsed.data.amount,
      date: parsed.data.payment_date,
      description: te("payrollPaidDescription", {
        name: payrollRow.staff_full_name,
        position: payrollRow.staff_position ?? te("staffFallback"),
        period: periodLabel,
      }),
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

  if (toDelete.length === 0) return await actionError("noPayrollRecordsMonth");

  const { error: deleteError } = await auth.supabase
    .from("payroll")
    .delete()
    .in("id", toDelete);
  if (deleteError) return { error: deleteError.message };

  revalidatePayrollPaths();
  return { data: { deleted: toDelete.length } };
}
