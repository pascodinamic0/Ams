export const PWA_INSTALL_DISMISS_KEY = "shuleos-pwa-install-dismissed";
export const PWA_INSTALL_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

export function markPwaInstallDismissed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(PWA_INSTALL_DISMISS_KEY, String(Date.now()));
}

export function isPwaInstallDismissed() {
  if (typeof window === "undefined") return false;
  const dismissedAt = localStorage.getItem(PWA_INSTALL_DISMISS_KEY);
  if (!dismissedAt) return false;
  return Date.now() - Number(dismissedAt) < PWA_INSTALL_DISMISS_MS;
}
