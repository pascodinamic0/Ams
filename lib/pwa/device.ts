/** Client-only device checks for PWA install guidance. */

export function isIosDevice() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return true;
  // iPadOS 13+ reports as Macintosh but is touch-capable
  return /macintosh/i.test(ua) && window.navigator.maxTouchPoints > 1;
}

export function isIosSafari() {
  if (!isIosDevice()) return false;
  const ua = window.navigator.userAgent;
  return /safari/i.test(ua) && !/crios|fxios|edgios|opios|chrome/i.test(ua);
}

export function isIosInAppBrowser() {
  if (!isIosDevice()) return false;
  const ua = window.navigator.userAgent;
  return /FBAN|FBAV|Instagram|Line\/|Twitter|Snapchat|WhatsApp|Messenger/i.test(
    ua
  );
}

export type IosSharePlacement = "bottom" | "top";

/**
 * Where the iOS share control lives for the current browser.
 * Safari on iPhone: bottom toolbar. Safari on iPad / Chrome / others: top.
 */
export function getIosSharePlacement(): IosSharePlacement {
  if (typeof window === "undefined") return "bottom";
  const ua = window.navigator.userAgent;
  const isIphone = /iphone|ipod/i.test(ua);
  if (isIosSafari() && isIphone) return "bottom";
  return "top";
}
