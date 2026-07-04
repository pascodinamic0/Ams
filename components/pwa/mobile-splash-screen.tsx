"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/components/company/brand-logo";
import { companyIdentity } from "@/lib/company/identity";
import { useIsMobile } from "@/lib/pwa/display-mode";
import { cn } from "@/lib/utils";

const SPLASH_MIN_MS = 700;
const SPLASH_FADE_MS = 280;

type SplashPhase = "show" | "fade" | "hide";

export function MobileSplashScreen() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const t = useTranslations("pwa");
  const [phase, setPhase] = useState<SplashPhase>("show");

  useEffect(() => {
    if (!isMobile) {
      setPhase("hide");
      return;
    }

    setPhase("show");

    const fadeTimer = window.setTimeout(() => setPhase("fade"), SPLASH_MIN_MS);
    const hideTimer = window.setTimeout(
      () => setPhase("hide"),
      SPLASH_MIN_MS + SPLASH_FADE_MS
    );

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [pathname, isMobile]);

  if (phase === "hide") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t("splashLoading", { productName: companyIdentity.productName })}
      className={cn(
        "fixed inset-0 z-[200] hidden max-md:flex flex-col items-center justify-center bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800 px-8 transition-opacity duration-300 ease-out",
        phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
      )}
    >
      <div className="flex flex-col items-center text-center">
        <BrandLogo
          size={72}
          variant="light"
          wordmarkClassName="text-3xl"
          imageClassName="shadow-2xl shadow-black/20"
        />
        <p className="mt-6 max-w-xs text-sm font-medium text-teal-100/90">
          {t("splashTagline", { tagline: companyIdentity.tagline })}
        </p>
        <div className="mt-8 flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-2 w-2 animate-pulse rounded-full bg-primary/80"
              style={{ animationDelay: `${dot * 180}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
