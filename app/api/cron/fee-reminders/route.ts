/**
 * Fee reminder cron job — POST /api/cron/fee-reminders
 *
 * This route is designed to be called once per day by Vercel Cron or any
 * external scheduler (e.g. GitHub Actions, cron-job.org).
 *
 * It:
 *  1. Finds all fee_reminder_settings records where enabled = true
 *  2. For each school, finds overdue / nearly-due invoices
 *  3. Applies grace period rules
 *  4. Sends the appropriate WhatsApp message to the linked guardian
 *
 * Security: protected by CRON_SECRET header.
 * Add CRON_SECRET=<random-string> to your env and configure your cron caller to send:
 *   Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWhatsApp, interpolateTemplate } from "@/lib/services/whatsapp";
import { format, addDays, differenceInDays } from "date-fns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  // Auth check
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = serviceClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const summary = {
    schools_processed: 0,
    reminders_sent: 0,
    final_warnings_sent: 0,
    errors: 0,
  };

  // 1. Fetch all enabled reminder settings
  const { data: settings, error: settingsErr } = await supabase
    .from("fee_reminder_settings")
    .select("*")
    .eq("enabled", true);

  if (settingsErr || !settings?.length) {
    return NextResponse.json({ message: "No active reminder settings found", summary });
  }

  for (const setting of settings) {
    summary.schools_processed++;

    const graceExpiry = addDays(today, -setting.grace_period_days);

    // 2. Fetch overdue/pending invoices for this school with student + guardian info
    const { data: invoices, error: invErr } = await supabase
      .from("fee_invoices")
      .select(`
        id, amount, amount_paid, due_date, status,
        students(
          id, first_name, last_name, school_id,
          guardian_students(
            guardians(name, phone)
          )
        )
      `)
      .in("status", ["pending", "overdue"])
      .lt("due_date", format(addDays(today, 4), "yyyy-MM-dd"))
      .eq("students.school_id", setting.school_id);

    if (invErr) {
      console.error("Fee reminder - invoice fetch error:", invErr);
      summary.errors++;
      continue;
    }

    type InvoiceStudent = {
      first_name: string;
      last_name: string;
      guardian_students?: Array<{
        guardians?: { name: string; phone?: string } | null;
      }>;
    };

    type InvoiceRow = typeof invoices extends (infer T)[] | null | undefined ? T & { students: InvoiceStudent | null } : never;

    for (const invoice of (invoices ?? []) as unknown as InvoiceRow[]) {
      const student = invoice.students;

      if (!student) continue;

      const studentName = `${student.first_name} ${student.last_name}`.trim();
      const dueDate = new Date(invoice.due_date);
      const daysUntilDue = differenceInDays(dueDate, today);
      const daysOverdue = differenceInDays(today, dueDate);
      const balance = Number(invoice.amount) - Number(invoice.amount_paid ?? 0);

      if (balance <= 0) continue;

      const guardianLinks = student.guardian_students ?? [];
      for (const link of guardianLinks) {
        const guardian = link.guardians;
        if (!guardian?.phone) continue;

        const vars = {
          guardian_name: guardian.name,
          student_name: studentName,
          amount: balance.toFixed(2),
          currency: setting.currency_symbol,
          due_date: format(dueDate, "MMM d, yyyy"),
          school_name: "",
        };

        let shouldSend = false;
        let isFinalWarning = false;

        if (setting.remind_on_due_day && daysUntilDue === 0) {
          shouldSend = true;
        }

        if (
          setting.remind_days_before?.includes(daysUntilDue) &&
          daysUntilDue > 0
        ) {
          shouldSend = true;
        }

        // Final warning: grace period has expired
        if (
          setting.remind_on_grace_expiry &&
          daysOverdue > 0 &&
          dueDate <= graceExpiry
        ) {
          shouldSend = true;
          isFinalWarning = true;
        }

        if (!shouldSend) continue;

        const template = isFinalWarning
          ? setting.final_warning_template
          : setting.morning_message_template;

        const message = interpolateTemplate(template, vars);
        const result = await sendWhatsApp(guardian.phone, message);

        if (result.success) {
          if (isFinalWarning) summary.final_warnings_sent++;
          else summary.reminders_sent++;
        } else {
          console.error("WhatsApp send error:", result.error, "to:", guardian.phone);
          summary.errors++;
        }
      }
    }
  }

  return NextResponse.json({ ok: true, summary });
}
