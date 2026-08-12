"use client";

import { useEffect, useRef, useState } from "react";
import type { Serwist } from "@serwist/window";
import { UpdatePrompt } from "@/components/pwa/update-prompt";

const RELOAD_FALLBACK_MS = 500;

function reloadToNewBuild() {
  window.location.reload();
}

export function SerwistProvider({ children }: { children: React.ReactNode }) {
  const serwistRef = useRef<Serwist | null>(null);
  const reloadingRef = useRef(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    let removeListeners: (() => void) | undefined;

    const onControllerChange = () => {
      if (!reloadingRef.current) return;
      reloadToNewBuild();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    void import("@serwist/window").then(({ Serwist }) => {
      if (cancelled) return;

      const serwist = new Serwist("/sw.js", { scope: "/", type: "classic" });
      serwistRef.current = serwist;

      serwist.addEventListener("waiting", () => {
        setUpdateAvailable(true);
      });

      serwist.addEventListener("controlling", () => {
        if (reloadingRef.current) {
          reloadToNewBuild();
        }
      });

      void serwist.register().then((registration) => {
        if (cancelled) return;
        if (registration?.waiting) {
          setUpdateAvailable(true);
        }
      });

      const checkForUpdate = () => {
        void serwist.update();
        void navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration?.waiting) setUpdateAvailable(true);
        });
      };

      const handleVisibility = () => {
        if (document.visibilityState === "visible") {
          checkForUpdate();
        }
      };

      window.addEventListener("focus", checkForUpdate);
      document.addEventListener("visibilitychange", handleVisibility);

      removeListeners = () => {
        window.removeEventListener("focus", checkForUpdate);
        document.removeEventListener("visibilitychange", handleVisibility);
      };

      if (cancelled) {
        removeListeners();
        serwistRef.current = null;
      }
    });

    return () => {
      cancelled = true;
      removeListeners?.();
      serwistRef.current = null;
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  function handleUpdate() {
    if (reloadingRef.current) return;
    reloadingRef.current = true;
    setUpdating(true);

    serwistRef.current?.messageSkipWaiting();

    void navigator.serviceWorker?.getRegistration().then((registration) => {
      registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
    });

    window.setTimeout(reloadToNewBuild, RELOAD_FALLBACK_MS);
  }

  function handleDismiss() {
    if (updating) return;
    setUpdateAvailable(false);
  }

  return (
    <>
      {children}
      <UpdatePrompt
        open={updateAvailable}
        updating={updating}
        onUpdate={handleUpdate}
        onDismiss={handleDismiss}
      />
    </>
  );
}
