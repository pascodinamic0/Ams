"use client";

import { useEffect } from "react";

export function SerwistProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    void import("@serwist/window").then(({ Serwist }) => {
      const serwist = new Serwist("/sw.js", { scope: "/", type: "classic" });
      void serwist.register();
    });
  }, []);

  return <>{children}</>;
}
