import { createClient } from "@/lib/supabase/server";

export type MonthlyCompletedTask = {
  id: string;
  title: string;
  description: string | null;
  department: string;
  priority: "low" | "medium" | "high";
  related_type: string | null;
  related_id: string | null;
  completed_at: string;
};

export type MonthlyExpenseDecision = {
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

export type MonthlyActivityReport = {
  school: {
    id: string;
    name: string;
    logo_url: string | null;
    address: string | null;
  } | null;
  year: number;
  month: number;
  monthStart: string;
  monthEnd: string;
  tasksCompleted: MonthlyCompletedTask[];
  expenseDecisions: MonthlyExpenseDecision[];
  summary: {
    tasksCompleted: number;
    financeTasksCompleted: number;
    expensesApproved: number;
    expensesRejected: number;
    approvedExpenseTotal: number;
    rejectedExpenseTotal: number;
  };
};

function monthBounds(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return {
    monthStart: start.toISOString(),
    monthEnd: end.toISOString(),
    monthStartDate: start.toISOString().slice(0, 10),
    monthEndDate: end.toISOString().slice(0, 10),
  };
}

export async function getMonthlyActivityReport(
  schoolId: string,
  year: number,
  month: number
): Promise<MonthlyActivityReport> {
  const supabase = await createClient();
  const { monthStart, monthEnd } = monthBounds(year, month);

  const [schoolResult, tasksResult, expensesResult] = await Promise.all([
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
      .gte("updated_at", monthStart)
      .lte("updated_at", monthEnd)
      .order("updated_at", { ascending: false }),
    supabase
      .from("expenses")
      .select(
        "id, category, amount, description, date, status, receipt_number, approved_at, branches(name, school_id)"
      )
      .in("status", ["approved", "rejected"])
      .gte("approved_at", monthStart)
      .lte("approved_at", monthEnd)
      .order("approved_at", { ascending: false }),
  ]);

  const tasksCompleted: MonthlyCompletedTask[] = (tasksResult.data ?? []).map(
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

  const expenseDecisions: MonthlyExpenseDecision[] = (expensesResult.data ?? [])
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

  const approved = expenseDecisions.filter((e) => e.status === "approved");
  const rejected = expenseDecisions.filter((e) => e.status === "rejected");

  return {
    school: schoolResult.data
      ? {
          id: schoolResult.data.id,
          name: schoolResult.data.name,
          logo_url: schoolResult.data.logo_url,
          address: schoolResult.data.address,
        }
      : null,
    year,
    month,
    monthStart,
    monthEnd,
    tasksCompleted,
    expenseDecisions,
    summary: {
      tasksCompleted: tasksCompleted.length,
      financeTasksCompleted: tasksCompleted.filter(
        (t) => t.department === "finance" || t.related_type === "expense"
      ).length,
      expensesApproved: approved.length,
      expensesRejected: rejected.length,
      approvedExpenseTotal: approved.reduce((sum, e) => sum + e.amount, 0),
      rejectedExpenseTotal: rejected.reduce((sum, e) => sum + e.amount, 0),
    },
  };
}
