"use client";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration("/");
    if (existing) return existing;
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export type SubscribePushResult =
  | { ok: true; permission: NotificationPermission }
  | { ok: false; error: string; permission?: NotificationPermission };

/** Request permission, subscribe to push, and persist the subscription server-side. */
export async function subscribeToPush(vapidPublicKey: string): Promise<SubscribePushResult> {
  if (!isPushSupported()) {
    return { ok: false, error: "unsupported" };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, error: "denied", permission };
  }

  const registration = await getServiceWorkerRegistration();
  if (!registration) {
    return { ok: false, error: "no_service_worker", permission };
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });
  }

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return { ok: false, error: "invalid_subscription", permission };
  }

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      userAgent: navigator.userAgent,
    }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: body?.error ?? "save_failed", permission };
  }

  return { ok: true, permission };
}

export async function unsubscribeFromPush(): Promise<{ ok: boolean; error?: string }> {
  if (!isPushSupported()) return { ok: true };

  const registration = await getServiceWorkerRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  const endpoint = subscription?.endpoint;

  if (subscription) {
    try {
      await subscription.unsubscribe();
    } catch {
      // Still remove from server
    }
  }

  if (endpoint) {
    const res = await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      return { ok: false, error: body?.error ?? "unsubscribe_failed" };
    }
  }

  return { ok: true };
}
