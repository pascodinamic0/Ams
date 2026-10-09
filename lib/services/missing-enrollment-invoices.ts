import { getCurrentSchoolYearStart } from "@/lib/academic/school-year";
import type { FeeStructureListItem } from "@/lib/db/fee-structures";
import { feeStructuresForClass } from "@/lib/services/enrollment-fees";
import { createAdminClient } from "@/lib/supabase/admin";

type StudentRow = {
  id: string;
  class_id: string | null;
  branch_id: string | null;
};

type FeeRow = {
  id: string;
  name: string;
  amount: number | string;
  description: string | null;
  class_id: string | null;
  branch_id: string;
  school_year: number;
  classes: { name?: string } | { name?: string }[] | null;
};

/**
 * Pending and active pupils who still owe a current-year class fee need an
 * enrollment facture. Without one they never appear on the unpaid list.
 */
export async function ensureMissingEnrollmentInvoices(options?: {
  schoolId?: string;
  branchId?: string;
}) {
  const admin = createAdminClient();
  if (!admin) return;

  const schoolYear = getCurrentSchoolYearStart();

  let studentQuery = admin
    .from("students")
    .select("id, class_id, branch_id")
    .in("status", ["pending", "active"])
    .not("class_id", "is", null);

  if (options?.schoolId) studentQuery = studentQuery.eq("school_id", options.schoolId);
  if (options?.branchId) studentQuery = studentQuery.eq("branch_id", options.branchId);

  const { data: students, error: studentError } = await studentQuery;
  if (studentError) {
    console.error("ensureMissingEnrollmentInvoices students:", studentError);
    return;
  }

  const roster = (students ?? []) as StudentRow[];
  const withClass = roster.filter(
    (student): student is StudentRow & { class_id: string; branch_id: string } =>
      Boolean(student.class_id && student.branch_id)
  );
  if (withClass.length === 0) return;

  const branchIds = [...new Set(withClass.map((student) => student.branch_id))];
  const { data: feeRows, error: feeError } = await admin
    .from("fee_structures")
    .select("id, name, amount, description, class_id, branch_id, school_year, classes(name)")
    .in("branch_id", branchIds)
    .eq("school_year", schoolYear);

  if (feeError) {
    console.error("ensureMissingEnrollmentInvoices fees:", feeError);
    return;
  }

  const feesByBranch = new Map<string, FeeStructureListItem[]>();
  for (const row of (feeRows ?? []) as FeeRow[]) {
    const classRow = Array.isArray(row.classes) ? row.classes[0] : row.classes;
    const fee: FeeStructureListItem = {
      id: row.id,
      name: row.name,
      amount: Number(row.amount),
      description: row.description,
      class_id: row.class_id,
      class_name: classRow?.name ?? null,
      branch_id: row.branch_id,
      school_year: Number(row.school_year),
    };
    const list = feesByBranch.get(row.branch_id) ?? [];
    list.push(fee);
    feesByBranch.set(row.branch_id, list);
  }

  const existing = new Set<string>();
  const studentIds = withClass.map((student) => student.id);
  for (let offset = 0; offset < studentIds.length; offset += 150) {
    const slice = studentIds.slice(offset, offset + 150);
    const { data, error } = await admin
      .from("fee_invoices")
      .select("student_id, fee_structure_id")
      .in("student_id", slice)
      .not("fee_structure_id", "is", null);
    if (error) {
      console.error("ensureMissingEnrollmentInvoices invoices:", error);
      return;
    }
    for (const invoice of data ?? []) {
      existing.add(`${invoice.student_id}:${invoice.fee_structure_id}`);
    }
  }

  const dueDate = new Date().toISOString().slice(0, 10);
  const inserts: {
    student_id: string;
    fee_structure_id: string;
    amount: number;
    amount_paid: number;
    due_date: string;
    status: "pending";
    description: string;
    source: "enrollment";
  }[] = [];

  for (const student of withClass) {
    const offers = feeStructuresForClass(
      feesByBranch.get(student.branch_id) ?? [],
      student.class_id,
      schoolYear
    );
    for (const offer of offers) {
      if (existing.has(`${student.id}:${offer.id}`)) continue;
      inserts.push({
        student_id: student.id,
        fee_structure_id: offer.id,
        amount: offer.amount,
        amount_paid: 0,
        due_date: dueDate,
        status: "pending",
        description: offer.description?.trim() || offer.name,
        source: "enrollment",
      });
    }
  }

  if (inserts.length === 0) return;

  const { error: insertError } = await admin.from("fee_invoices").insert(inserts);
  if (insertError) {
    console.error("ensureMissingEnrollmentInvoices insert:", insertError);
  }
}
