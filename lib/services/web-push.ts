import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getVapidPrivateKey,
  getVapidPublicKey,
  getVapidSubject,
  isWebPushConfigured,
} from "@/lib/push/vapid";

export type PushPayload = {
  title: string;
  body?: string | null;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
};

type SubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return true;
  const publicKey = getVapidPublicKey();
  const privateKey = getVapidPrivateKey();
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(getVapidSubject(), publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

async function deleteSubscription(endpoint: string) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("push_subscriptions").delete().eq("endpoint", endpoint);
}

async function sendToSubscription(sub: SubscriptionRow, payload: PushPayload) {
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body ?? "",
        url: payload.url ?? "/notifications",
        tag: payload.tag,
        requireInteraction: payload.requireInteraction ?? false,
      })
    );
    return { ok: true as const };
  } catch (err) {
    const statusCode =
      err && typeof err === "object" && "statusCode" in err
        ? Number((err as { statusCode?: number }).statusCode)
        : undefined;

    // Gone / expired subscription
    if (statusCode === 404 || statusCode === 410) {
      await deleteSubscription(sub.endpoint);
    } else {
      console.error("web-push send error:", err);
    }
    return { ok: false as const, statusCode };
  }
}

/** Send a Web Push to all of a user's registered devices. */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!isWebPushConfigured() || !ensureVapid()) {
    return { sent: 0, failed: 0 };
  }

  const admin = createAdminClient();
  if (!admin) return { sent: 0, failed: 0 };

  const { data: prefs } = await admin
    .from("notification_preferences")
    .select("push_enabled")
    .eq("user_id", userId)
    .maybeSingle();

  if (prefs && prefs.push_enabled === false) {
    return { sent: 0, failed: 0 };
  }

  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error || !subs?.length) {
    if (error) console.error("sendPushToUser fetch error:", error.message);
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;
  for (const sub of subs as SubscriptionRow[]) {
    const result = await sendToSubscription(sub, payload);
    if (result.ok) sent += 1;
    else failed += 1;
  }

  return { sent, failed };
}
