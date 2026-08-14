"use client";

import { useEffect, useRef, useState } from "react";
import type { Serwist } from "@serwist/window";
import { UpdatePrompt } from "@/components/pwa/update-prompt";

const DISMISS_KEY = "shuleos.pwa.update.dismissed";
const APPLY_KEY = "shuleos.pwa.update.apply";
const APPLY_ATTEMPTS_KEY = "shuleos.pwa.update.attempts";
const SKIP_WAITING_TIMEOUT_MS = 4_000;

declare global {
  interface Window {
    serwist?: Serwist;
  }
}

function readFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean) {
  try {
    if (value) sessionStorage.setItem(key, "1");
    else sessionStorage.removeItem(key);
  } catch {
    // Private mode can block sessionStorage; ignore.
  }
}

function readAttempts(): number {
  try {
    return Number(sessionStorage.getItem(APPLY_ATTEMPTS_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

function writeAttempts(count: number) {
  try {
    if (count <= 0) sessionStorage.removeItem(APPLY_ATTEMPTS_KEY);
    else sessionStorage.setItem(APPLY_ATTEMPTS_KEY, String(count));
  } catch {
    // ignore
  }
}

async function unregisterAllWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}

async function getSerwist(): Promise<Serwist> {
  if (window.serwist) return window.serwist;
  const { Serwist } = await import("@serwist/window");
  const created = new Serwist("/sw.js", { scope: "/", type: "classic" });
  window.serwist = created;
  return created;
}

export function SerwistProvider({ children }: { children: React.ReactNode }) {
  const applyRef = useRef<() => void>(() => {});
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    let removeVisibility: (() => void) | undefined;
    const applying = { current: false };
    const reloaded = { current: false };
    let skipTimeout: number | undefined;
    const serwistHolder: { current: Serwist | null } = { current: null };

    const reloadOnce = () => {
      if (reloaded.current) return;
      reloaded.current = true;
      if (skipTimeout !== undefined) {
        window.clearTimeout(skipTimeout);
        skipTimeout = undefined;
      }
      window.location.reload();
    };

    const finish = () => {
      writeFlag(APPLY_KEY, false);
      writeAttempts(0);
      reloadOnce();
    };

    const applyWaitingWorker = () => {
      if (applying.current || reloaded.current) return;
      applying.current = true;
      setUpdating(true);
      writeFlag(APPLY_KEY, true);
      writeFlag(DISMISS_KEY, false);

      const attempts = readAttempts() + 1;
      writeAttempts(attempts);

      void (async () => {
        if (attempts >= 2) {
          await unregisterAllWorkers();
          finish();
          return;
        }

        serwistHolder.current?.messageSkipWaiting();
        const registration = await navigator.serviceWorker.getRegistration();
        registration?.waiting?.postMessage({ type: "SKIP_WAITING" });

        skipTimeout = window.setTimeout(() => {
          void unregisterAllWorkers().then(finish);
        }, SKIP_WAITING_TIMEOUT_MS);
      })();
    };

    applyRef.current = applyWaitingWorker;

    void (async () => {
      const serwist = await getSerwist();
      if (cancelled) return;
      serwistHolder.current = serwist;

      const promptIfNeeded = (wasWaitingBeforeRegister?: boolean) => {
        if (applying.current || readFlag(APPLY_KEY)) {
          applyWaitingWorker();
          return;
        }
        if (wasWaitingBeforeRegister && readFlag(DISMISS_KEY)) {
          return;
        }
        setUpdateAvailable(true);
      };

      serwist.addEventListener("installing", () => {
        writeFlag(DISMISS_KEY, false);
      });

      serwist.addEventListener("waiting", (event) => {
        promptIfNeeded(event.wasWaitingBeforeRegister);
      });

      serwist.addEventListener("controlling", () => {
        if (!applying.current && !readFlag(APPLY_KEY)) return;
        finish();
      });

      const registration = await serwist.register();
      if (cancelled) return;

      if (registration?.waiting) {
        promptIfNeeded(true);
      }

      const checkForUpdate = () => {
        if (document.visibilityState !== "visible") return;
        void serwist.update();
      };

      window.addEventListener("focus", checkForUpdate);
      document.addEventListener("visibilitychange", checkForUpdate);
      removeVisibility = () => {
        window.removeEventListener("focus", checkForUpdate);
        document.removeEventListener("visibilitychange", checkForUpdate);
      };
    })();

    return () => {
      cancelled = true;
      removeVisibility?.();
      if (skipTimeout !== undefined) window.clearTimeout(skipTimeout);
      applyRef.current = () => {};
    };
  }, []);

  function handleDismiss() {
    if (updating) return;
    writeFlag(DISMISS_KEY, true);
    setUpdateAvailable(false);
  }

  return (
    <>
      {children}
      <UpdatePrompt
        open={updateAvailable || updating}
        updating={updating}
        onUpdate={() => applyRef.current()}
        onDismiss={handleDismiss}
      />
    </>
  );
}
