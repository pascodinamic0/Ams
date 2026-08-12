/**
 * Transactional email via Resend.
 *
 * Required env vars:
 *   RESEND_API_KEY
 *
 * Optional:
 *   RESEND_FROM - e.g. "ShuleOS <noreply@shuleos.app>"
 *                 Defaults to Resend's onboarding address (dev/testing only).
 *
 * Auth emails (invite, signup confirm, password reset) are still triggered by
 * Supabase Auth - point Supabase SMTP at Resend so those go through Resend too.
 */

import { Resend } from "resend";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string | string[];
  /** Prevents duplicate sends on retries. Pattern: event-type/entity-id */
  idempotencyKey?: string;
};

export type SendEmailResult = {
  success: boolean;
  id?: string;
  error?: string;
};

let client: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function defaultFrom(): string {
  return (
    process.env.RESEND_FROM?.trim() ||
    "ShuleOS <onboarding@resend.dev>"
  );
}

/**
 * Send a single transactional email.
 * Returns success:false (does not throw) when Resend is unset or the API fails.
 */
export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  const resend = getResend();
  if (!resend) {
    return {
      success: false,
      error:
        "Missing RESEND_API_KEY. Add it to .env.local (and Vercel) to send email.",
    };
  }

  try {
    const { data, error } = await resend.emails.send(
      {
        from: defaultFrom(),
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: input.replyTo,
      },
      input.idempotencyKey
        ? { idempotencyKey: input.idempotencyKey }
        : undefined
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    return { success: false, error: message };
  }
}

/** Escape user-controlled text before interpolating into HTML email bodies. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendAdmissionApprovedEmail(opts: {
  to: string;
  studentName: string;
  schoolName?: string | null;
  applicationId?: string;
}): Promise<SendEmailResult> {
  const student = escapeHtml(opts.studentName);
  const school = opts.schoolName ? escapeHtml(opts.schoolName) : "your school";

  return sendEmail({
    to: opts.to,
    subject: `Admission approved - ${opts.studentName}`,
    html: `
      <p>Good news.</p>
      <p><strong>${student}</strong>'s admission application at <strong>${school}</strong> has been approved.</p>
      <p>If you have an account, sign in to complete the next steps. If you need help, reply to this email or contact the school office.</p>
    `,
    text: `${opts.studentName}'s admission application at ${opts.schoolName ?? "your school"} has been approved.`,
    idempotencyKey: opts.applicationId
      ? `admission-approved/${opts.applicationId}`
      : undefined,
  });
}

export async function sendPlainTextEmail(opts: {
  to: string;
  subject: string;
  body: string;
  idempotencyKey?: string;
}): Promise<SendEmailResult> {
  const safe = escapeHtml(opts.body).replace(/\n/g, "<br />");
  return sendEmail({
    to: opts.to,
    subject: opts.subject,
    html: `<p>${safe}</p>`,
    text: opts.body,
    idempotencyKey: opts.idempotencyKey,
  });
}
