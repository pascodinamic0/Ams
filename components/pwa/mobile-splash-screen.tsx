"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { companyIdentity } from "@/lib/company/identity";
import { useIsMobile } from "@/lib/pwa/display-mode";
import { cn } from "@/lib/utils";

const SPLASH_MIN_MS = 1100;
const SPLASH_FADE_MS = 320;
const SPLASH_SEEN_KEY = "ams-splash-seen";

type SplashPhase = "show" | "fade" | "hide";

function hasSeenSplash(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSplashSeen() {
  try {
    sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

export function MobileSplashScreen() {
  const isMobile = useIsMobile();
  const t = useTranslations("pwa");
  const [phase, setPhase] = useState<SplashPhase>("hide");

  useEffect(() => {
    if (!isMobile || hasSeenSplash()) return;

    markSplashSeen();
    const showTimer = window.setTimeout(() => setPhase("show"), 0);
    const fadeTimer = window.setTimeout(() => setPhase("fade"), SPLASH_MIN_MS);
    const hideTimer = window.setTimeout(
      () => setPhase("hide"),
      SPLASH_MIN_MS + SPLASH_FADE_MS
    );

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isMobile]);

  if (phase === "hide") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t("splashLoading", { productName: companyIdentity.productName })}
      className={cn(
        "fixed inset-0 z-[200] hidden max-md:flex flex-col items-center justify-center bg-white px-8 transition-opacity duration-300 ease-out",
        "bg-[radial-gradient(circle_at_50%_34%,rgba(232,145,45,0.07),transparent_40%),radial-gradient(circle_at_50%_72%,rgba(15,79,73,0.05),transparent_46%)]",
        phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
      )}
    >
      <div className="flex w-full max-w-[18rem] flex-col items-center text-center">
        <Image
          src="/images/shuleos-logo.png"
          alt={companyIdentity.productName}
          width={1024}
          height={1024}
          priority
          className="h-auto w-full select-none"
        />
        <div className="mt-8 flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0F4F49]/70"
              style={{ animationDelay: `${dot * 180}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
