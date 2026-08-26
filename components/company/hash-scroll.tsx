"use client";

import { useEffect } from "react";

export function HashScroll() {
  useEffect(() => {
    function scrollToHashTarget() {
      const hash = window.location.hash.slice(1);
      if (!hash) return;

      const target = document.getElementById(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    const timeoutId = window.setTimeout(scrollToHashTarget, 150);
    window.addEventListener("hashchange", scrollToHashTarget);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("hashchange", scrollToHashTarget);
    };
  }, []);

  return null;
}
