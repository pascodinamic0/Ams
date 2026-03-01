/**
 * WhatsApp service via Twilio REST API.
 * No extra package required — uses native fetch.
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM   — e.g. "whatsapp:+14155238886"
 */

export interface WhatsAppResult {
  success: boolean;
  sid?: string;
  error?: string;
}

function twilioCredentials() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    throw new Error(
      "Missing Twilio credentials. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM."
    );
  }
  return { accountSid, authToken, from };
}

/**
 * Send a single WhatsApp message to a phone number.
 * @param to   E.164 format phone number, e.g. "+233201234567"
 * @param body Message text (max ~1600 chars for WhatsApp)
 */
export async function sendWhatsApp(
  to: string,
  body: string
): Promise<WhatsAppResult> {
  try {
    const { accountSid, authToken, from } = twilioCredentials();

    const toWhatsApp = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const params = new URLSearchParams({
      From: from,
      To: toWhatsApp,
      Body: body,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const json = (await res.json()) as { sid?: string; message?: string; code?: number };

    if (!res.ok) {
      return {
        success: false,
        error: json.message ?? `Twilio error ${res.status}`,
      };
    }

    return { success: true, sid: json.sid };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown WhatsApp error";
    return { success: false, error: message };
  }
}

/**
 * Send WhatsApp messages to multiple recipients in parallel (capped at 10 at a time).
 */
export async function sendWhatsAppBulk(
  recipients: Array<{ phone: string; body: string; id?: string }>
): Promise<Array<WhatsAppResult & { id?: string }>> {
  const CONCURRENCY = 10;
  const results: Array<WhatsAppResult & { id?: string }> = [];

  for (let i = 0; i < recipients.length; i += CONCURRENCY) {
    const chunk = recipients.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(
      chunk.map(async (r) => {
        const result = await sendWhatsApp(r.phone, r.body);
        return { ...result, id: r.id };
      })
    );
    results.push(...chunkResults);
  }

  return results;
}

/**
 * Interpolate a message template with dynamic variables.
 * Supports: {guardian_name}, {student_name}, {amount}, {currency}, {due_date}, {school_name}
 */
export function interpolateTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}
