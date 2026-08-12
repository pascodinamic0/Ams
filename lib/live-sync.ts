/** Dispatched after App Router data is refreshed so client widgets can catch up. */
export const LIVE_REFRESH_EVENT = "shuleos:live-refresh";

export function notifyLiveRefresh() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LIVE_REFRESH_EVENT));
}
