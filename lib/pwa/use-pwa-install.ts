"use client";

import { useCallback, useEffect, useState } from "react";
import { isStandaloneMode } from "@/lib/pwa/display-mode";

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosDevice() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  // Classic iPhone / iPad / iPod user agents
  if (/iphone|ipad|ipod/i.test(ua)) return true;
  // iPadOS 13+ reports as Macintosh but is touch-capable
  return /macintosh/i.test(ua) && window.navigator.maxTouchPoints > 1;
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

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    registerInstallListener();
    setIos(isIosDevice());
    setInstalled(isStandaloneMode());

    function handlePromptChange(prompt: BeforeInstallPromptEvent | null) {
      setDeferredPrompt(prompt);
    }

    listeners.add(handlePromptChange);
    setDeferredPrompt(sharedDeferredPrompt);

    const media = window.matchMedia("(display-mode: standalone)");
    const handleDisplayChange = () => setInstalled(isStandaloneMode());
    media.addEventListener("change", handleDisplayChange);

    return () => {
      listeners.delete(handlePromptChange);
      media.removeEventListener("change", handleDisplayChange);
    };
  }, []);

  const install = useCallback(async () => {
    if (!sharedDeferredPrompt) return false;
    await sharedDeferredPrompt.prompt();
    const { outcome } = await sharedDeferredPrompt.userChoice;
    sharedDeferredPrompt = null;
    notifyListeners();
    setInstalled(isStandaloneMode());
    return outcome === "accepted";
  }, []);

  return {
    deferredPrompt,
    installed,
    ios,
    canInstall: Boolean(deferredPrompt),
    install,
  };
}
