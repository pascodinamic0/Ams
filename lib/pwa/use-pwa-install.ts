"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  getIosSharePlacement,
  isIosDevice,
  isIosInAppBrowser,
  type IosSharePlacement,
} from "@/lib/pwa/device";
import { isStandaloneMode } from "@/lib/pwa/display-mode";

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let sharedDeferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();
let listenerRegistered = false;

function notifyListeners() {
  listeners.forEach((listener) => listener(sharedDeferredPrompt));
}

function registerInstallListener() {
  if (typeof window === "undefined" || listenerRegistered) return;
  listenerRegistered = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    sharedDeferredPrompt = event as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener("appinstalled", () => {
    sharedDeferredPrompt = null;
    notifyListeners();
  });
}

function subscribeNoop() {
  return () => {};
}

function subscribeStandalone(onStoreChange: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", onStoreChange);
  window.addEventListener("appinstalled", onStoreChange);
  return () => {
    media.removeEventListener("change", onStoreChange);
    window.removeEventListener("appinstalled", onStoreChange);
  };
}

/** True only after hydration — safe to read `window` / user agent. */
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export function usePwaInstall() {
  const isClient = useIsClient();
  const installed = useSyncExternalStore(
    subscribeStandalone,
    isStandaloneMode,
    () => false
  );
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(() => sharedDeferredPrompt);

  useEffect(() => {
    registerInstallListener();

    function handlePromptChange(prompt: BeforeInstallPromptEvent | null) {
      setDeferredPrompt(prompt);
    }

    listeners.add(handlePromptChange);
    return () => {
      listeners.delete(handlePromptChange);
    };
  }, []);

  const install = useCallback(async () => {
    if (!sharedDeferredPrompt) return false;
    await sharedDeferredPrompt.prompt();
    const { outcome } = await sharedDeferredPrompt.userChoice;
    sharedDeferredPrompt = null;
    notifyListeners();
    return outcome === "accepted";
  }, []);

  const ios = isClient && isIosDevice();
  const inAppBrowser = isClient && isIosInAppBrowser();
  const sharePlacement: IosSharePlacement = isClient
    ? getIosSharePlacement()
    : "bottom";

  return {
    deferredPrompt,
    installed,
    ios,
    inAppBrowser,
    sharePlacement,
    ready: isClient,
    canInstall: Boolean(deferredPrompt),
    install,
  };
}
