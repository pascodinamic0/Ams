/** Public VAPID key for PushManager.subscribe (safe to expose to the browser). */
export function getVapidPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  return key || null;
}

export function getVapidPrivateKey(): string | null {
  const key = process.env.VAPID_PRIVATE_KEY?.trim();
  return key || null;
}

export function getVapidSubject(): string {
  return (
    process.env.VAPID_SUBJECT?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "mailto:support@shuleos.app"
  );
}

export function isWebPushConfigured(): boolean {
  return Boolean(getVapidPublicKey() && getVapidPrivateKey());
}
