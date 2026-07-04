"use client";

import { useEffect, useState } from "react";

export function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

export function useIsStandalone() {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandaloneMode());

    const media = window.matchMedia("(display-mode: standalone)");
    const handleChange = () => setStandalone(isStandaloneMode());
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return standalone;
}

export function useIsMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const handleChange = () => setMobile(media.matches);
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return mobile;
}
