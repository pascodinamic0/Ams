import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getInvoiceById } from "@/lib/db";

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function ParentPayPage({
  searchParams,
}: {
  searchParams: Promise<{ invoice?: string }>;
}) {
  const params = await searchParams;
  const invoiceId = params.invoice;

  if (!invoiceId) {
    return (
      <EmptyState
        title="No invoice selected"
        description="Choose an invoice from the fees page to view payment instructions."
        action={
          <Link href="/parent/fees">
            <Button>View fees</Button>
          </Link>
        }
      />
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <EmptyState title="Not signed in" description="Please log in to continue." />
    );
  }

  const { data: guardian } = await supabase
    .from("guardians")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!guardian) {
    return (
      <EmptyState
        title="No guardian profile"
        description="Your account is not linked to a guardian profile."
      />
    );
  }

  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    return (
      <EmptyState title="Invoice not found" description="This invoice may have been removed." />
    );
  }

  const student = invoice.students as {
    id: string;
    first_name: string;
    last_name: string;
    student_id: string | null;
    school_id: string;
  } | null;

  const { data: link } = await supabase
    .from("guardian_students")
    .select("student_id")
    .eq("guardian_id", guardian.id)
    .eq("student_id", student?.id ?? "")
    .maybeSingle();

  if (!link) {
    return (
      <EmptyState
        title="Access denied"
        description="You can only pay invoices for your linked students."
      />
    );
  }

  const { data: school } = await supabase
    .from("schools")
    .select("name, contact_email, contact_phone, address")
    .eq("id", student?.school_id ?? "")
    .single();

  const amount = Number(invoice.amount);
  const amountPaid = Number(invoice.amount_paid ?? 0);
  const balance = Math.max(0, amount - amountPaid);
  const studentName = student
    ? `${student.first_name} ${student.last_name}`.trim()
    : "Student";

  if (balance <= 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Payment</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-600">This invoice is already fully paid. Thank you!</p>
            <Link href="/parent/fees" className="mt-4 inline-block">
              <Button variant="ghost">Back to fees</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pay fees</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manual payment instructions - online card payments are not enabled yet.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="text-slate-500">Student:</span> {studentName}{student?.student_id ? ` (${student.student_id})` : ""}</p>
          <p><span className="text-slate-500">Description:</span> {invoice.description ?? "School fees"}</p>
          <p><span className="text-slate-500">Due date:</span> {invoice.due_date}</p>
          <p><span className="text-slate-500">Total:</span> {formatCurrency(amount)}</p>
          <p><span className="text-slate-500">Paid:</span> {formatCurrency(amountPaid)}</p>
          <p className="text-lg font-semibold">
            <span className="text-slate-500 font-normal">Amount due:</span> {formatCurrency(balance)}
          </p>
          <p className="text-slate-500">Reference: <span className="font-mono text-slate-900 dark:text-white">{invoice.id.slice(0, 8).toUpperCase()}</span></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to pay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <ol className="list-decimal space-y-2 pl-5">
            <li>Pay <strong>{formatCurrency(balance)}</strong> via bank transfer or mobile money.</li>
            <li>
              Use reference <strong className="font-mono">{invoice.id.slice(0, 8).toUpperCase()}</strong> and
              student name <strong>{studentName}</strong> in the payment description.
            </li>
            <li>
              Send proof of payment to{" "}
              {school?.contact_email ? (
                <a href={`mailto:${school.contact_email}`} className="text-indigo-600 underline">
                  {school.contact_email}
                </a>
              ) : (
                "the school finance office"
              )}
              {school?.contact_phone ? ` or call ${school.contact_phone}` : ""}.
            </li>
            <li>Your payment will be recorded by the school and the invoice will update within 1-2 business days.</li>
          </ol>
          {school?.address && (
            <p className="border-t pt-4 text-slate-500">
              {school.name} - {school.address}
            </p>
          )}
        </CardContent>
      </Card>

      <Link href="/parent/fees">
        <Button variant="ghost">Back to fees</Button>
      </Link>
    </div>
  );
}
