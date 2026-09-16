import { createClient } from "@/lib/supabase/server";

export type ActivityCompletedTask = {
  id: string;
  title: string;
  description: string | null;
  department: string;
  priority: "low" | "medium" | "high";
  related_type: string | null;
  related_id: string | null;
  completed_at: string;
};

export type ActivityExpenseDecision = {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  date: string;
  status: "approved" | "rejected";
  receipt_number: string | null;
  approved_at: string;
  branch_name: string | null;
};

export type ActivityIncomePayment = {
  id: string;
  amount: number;
  method: string;
  paid_at: string;
  student_name: string;
  student_code: string;
  class_name: string | null;
  is_new_enrollment: boolean;
};

export type ActivityReport = {
  school: {
    id: string;
    name: string;
    logo_url: string | null;
    address: string | null;
  } | null;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  tasksCompleted: ActivityCompletedTask[];
  expenseDecisions: ActivityExpenseDecision[];
  incomePayments: ActivityIncomePayment[];
  summary: {
    tasksCompleted: number;
    financeTasksCompleted: number;
    expensesApproved: number;
    expensesRejected: number;
    approvedExpenseTotal: number;
    rejectedExpenseTotal: number;
    incomeTotal: number;
    newEnrollmentIncomeTotal: number;
    otherIncomeTotal: number;
    netIncome: number;
  };
};

/** @deprecated Use ActivityCompletedTask */
export type MonthlyCompletedTask = ActivityCompletedTask;

/** @deprecated Use ActivityExpenseDecision */
export type MonthlyExpenseDecision = ActivityExpenseDecision;

/** @deprecated Use ActivityReport */
export type MonthlyActivityReport = ActivityReport & {
  year: number;
  month: number;
  monthStart: string;
  monthEnd: string;
};

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function monthBounds(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return {
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    periodLabel: `${year}-${String(month).padStart(2, "0")}`,
  };
}

function dayBounds(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const end = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
  return {
    periodStart: start.toISOString(),
    periodEnd: end.toISOString(),
    periodLabel: dateStr,
  };
}

export async function getActivityReport(
  schoolId: string,
  periodStart: string,
  periodEnd: string,
  periodLabel: string
): Promise<ActivityReport> {
  const supabase = await createClient();

  const [schoolResult, tasksResult, expensesResult, paymentsResult] =
    await Promise.all([
      supabase
        .from("schools")
        .select("id, name, logo_url, address")
        .eq("id", schoolId)
        .single(),
      supabase
        .from("school_tasks")
        .select(
          "id, title, description, department, priority, related_type, related_id, updated_at"
        )
        .eq("school_id", schoolId)
        .eq("status", "done")
        .gte("updated_at", periodStart)
        .lte("updated_at", periodEnd)
        .order("updated_at", { ascending: false }),
      supabase
        .from("expenses")
        .select(
          "id, category, amount, description, date, status, receipt_number, approved_at, branches(name, school_id)"
        )
        .in("status", ["approved", "rejected"])
        .gte("approved_at", periodStart)
        .lte("approved_at", periodEnd)
        .order("approved_at", { ascending: false }),
      supabase
        .from("fee_payments")
        .select(
          `
          id,
          amount,
          method,
          paid_at,
          fee_invoices(
            students(
              first_name,
              last_name,
              student_id,
              school_id,
              created_at,
              classes(name)
            )
          )
        `
        )
        .gte("paid_at", periodStart)
        .lte("paid_at", periodEnd)
        .order("paid_at", { ascending: false }),
    ]);

  const tasksCompleted: ActivityCompletedTask[] = (tasksResult.data ?? []).map(
    (row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      department: row.department,
      priority: row.priority as "low" | "medium" | "high",
      related_type: row.related_type,
      related_id: row.related_id,
      completed_at: row.updated_at,
    })
  );

  const expenseDecisions: ActivityExpenseDecision[] = (expensesResult.data ?? [])
    .map((row) => {
      const branches = row.branches as
        | { name?: string; school_id?: string }
        | null
        | undefined;
      return {
        id: row.id,
        category: row.category,
        amount: Number(row.amount),
        description: row.description,
        date: row.date,
        status: row.status as "approved" | "rejected",
        receipt_number: row.receipt_number,
        approved_at: row.approved_at as string,
        branch_name: branches?.name ?? null,
        school_id: branches?.school_id ?? null,
      };
    })
    .filter((row) => row.school_id === schoolId)
    .map((row) => ({
      id: row.id,
      category: row.category,
      amount: row.amount,
      description: row.description,
      date: row.date,
      status: row.status,
      receipt_number: row.receipt_number,
      approved_at: row.approved_at,
      branch_name: row.branch_name,
    }));

  const incomePayments: ActivityIncomePayment[] = (paymentsResult.data ?? [])
    .map((row) => {
      const invoice = row.fee_invoices as {
        students?: {
          first_name?: string;
          last_name?: string;
          student_id?: string;
          school_id?: string;
          created_at?: string;
          classes?: { name?: string } | null;
        } | null;
      } | null;
      const student = invoice?.students;
      const studentName = student
        ? `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim()
        : "—";
      const paidAt = row.paid_at as string;
      const enrollmentDate = student?.created_at
        ? toDateKey(student.created_at)
        : null;
      const isNewEnrollment =
        enrollmentDate !== null && enrollmentDate === toDateKey(paidAt);

      return {
        id: row.id,
        amount: Number(row.amount),
        method: row.method ?? "other",
        paid_at: paidAt,
        student_name: studentName,
        student_code: student?.student_id ?? "—",
        class_name: student?.classes?.name ?? null,
        is_new_enrollment: isNewEnrollment,
        _school_id: student?.school_id ?? null,
      };
    })
    .filter((row) => row._school_id === schoolId)
    .sort((a, b) => {
      if (a.is_new_enrollment !== b.is_new_enrollment) {
        return a.is_new_enrollment ? -1 : 1;
      }
      return b.paid_at.localeCompare(a.paid_at);
    })
    .map(({ _school_id: _s, ...item }) => item);

  const approved = expenseDecisions.filter((e) => e.status === "approved");
  const rejected = expenseDecisions.filter((e) => e.status === "rejected");
  const incomeTotal = incomePayments.reduce((sum, p) => sum + p.amount, 0);
  const newEnrollmentIncomeTotal = incomePayments
    .filter((p) => p.is_new_enrollment)
    .reduce((sum, p) => sum + p.amount, 0);
  const approvedExpenseTotal = approved.reduce((sum, e) => sum + e.amount, 0);

  return {
    school: schoolResult.data
      ? {
          id: schoolResult.data.id,
          name: schoolResult.data.name,
          logo_url: schoolResult.data.logo_url,
          address: schoolResult.data.address,
        }
      : null,
    periodStart,
    periodEnd,
    periodLabel,
    tasksCompleted,
    expenseDecisions,
    incomePayments,
    summary: {
      tasksCompleted: tasksCompleted.length,
      financeTasksCompleted: tasksCompleted.filter(
        (t) => t.department === "finance" || t.related_type === "expense"
      ).length,
      expensesApproved: approved.length,
      expensesRejected: rejected.length,
      approvedExpenseTotal,
      rejectedExpenseTotal: rejected.reduce((sum, e) => sum + e.amount, 0),
      incomeTotal,
      newEnrollmentIncomeTotal,
      otherIncomeTotal: incomeTotal - newEnrollmentIncomeTotal,
      netIncome: incomeTotal - approvedExpenseTotal,
    },
  };
}

export async function getMonthlyActivityReport(
  schoolId: string,
  year: number,
  month: number
): Promise<MonthlyActivityReport> {
  const { periodStart, periodEnd, periodLabel } = monthBounds(year, month);
  const report = await getActivityReport(
    schoolId,
    periodStart,
    periodEnd,
    periodLabel
  );
  return {
    ...report,
    year,
    month,
    monthStart: periodStart,
    monthEnd: periodEnd,
  };
}

export async function getDailyActivityReport(
  schoolId: string,
  date: string
): Promise<ActivityReport> {
  const { periodStart, periodEnd, periodLabel } = dayBounds(date);
  return getActivityReport(schoolId, periodStart, periodEnd, periodLabel);
}
