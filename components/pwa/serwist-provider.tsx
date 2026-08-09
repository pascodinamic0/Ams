"use client";

import { useEffect, useRef, useState } from "react";
import type { Serwist } from "@serwist/window";
import { UpdatePrompt } from "@/components/pwa/update-prompt";

export function SerwistProvider({ children }: { children: React.ReactNode }) {
  const serwistRef = useRef<Serwist | null>(null);
  const reloadOnControlRef = useRef(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    let removeListeners: (() => void) | undefined;

    void import("@serwist/window").then(({ Serwist }) => {
      if (cancelled) return;

      const serwist = new Serwist("/sw.js", { scope: "/", type: "classic" });
      serwistRef.current = serwist;

      serwist.addEventListener("waiting", () => {
        setUpdateAvailable(true);
      });

      serwist.addEventListener("controlling", () => {
        if (reloadOnControlRef.current) {
          window.location.reload();
        }
      });

      void serwist.register();

      const checkForUpdate = () => {
        void serwist.update();
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
    };
  }, []);

  function handleUpdate() {
    const serwist = serwistRef.current;
    if (!serwist) return;
    reloadOnControlRef.current = true;
    serwist.messageSkipWaiting();
  }

  function handleDismiss() {
    setUpdateAvailable(false);
  }

  return (
    <>
      {children}
      <UpdatePrompt
        open={updateAvailable}
        onUpdate={handleUpdate}
        onDismiss={handleDismiss}
      />
    </>
  );
}
