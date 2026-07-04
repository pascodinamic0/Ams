"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useIsMobile } from "@/lib/pwa/display-mode";

export function AppToaster() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Toaster
      position={isMobile ? "top-center" : "top-right"}
      richColors
      closeButton
      toastOptions={{
        style: isMobile
          ? { marginTop: "calc(env(safe-area-inset-top) + 0.5rem)" }
          : undefined,
      }}
    />
  );
}
