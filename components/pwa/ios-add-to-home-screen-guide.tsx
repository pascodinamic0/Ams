"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { companyIdentity } from "@/lib/company/identity";
import { BrandLogoMark } from "@/components/company/brand-logo-mark";
import { usePwaInstall } from "@/lib/pwa/use-pwa-install";
import { cn } from "@/lib/utils";

type IosAddToHomeScreenGuideProps = {
  /** `embedded` sits inside onboarding (title already shown). `full` includes headline. */
  variant?: "embedded" | "full";
  className?: string;
};

function IosShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3.5v10.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8.2 7 12 3.2 15.8 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 11.5V18a2.5 2.5 0 0 0 2.5 2.5h6A2.5 2.5 0 0 0 17.5 18v-6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IosAddSquareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 8v8M8 12h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TapRing({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute -inset-1.5 rounded-full border-[2.5px] border-[#FF3B30]",
        className
      )}
      aria-hidden="true"
    />
  );
}

function HomeScreenHero({ productName }: { productName: string }) {
  const icons = [
    "bg-[#5ac8fa]",
    "bg-[#ff9500]",
    "bg-[#34c759]",
    "bg-[#af52de]",
    "bg-[#ff2d55]",
    "bg-[#007aff]",
  ];

  return (
    <div className="relative mx-auto h-[176px] w-[176px]" aria-hidden="true">
      <div className="absolute left-1/2 top-2 w-[112px] -translate-x-[62%] overflow-hidden rounded-[1.35rem] border-[5px] border-stone-800 bg-[#d8d8de] shadow-lg">
        <div className="flex h-3 items-center justify-center bg-black">
          <span className="h-1 w-8 rounded-full bg-stone-700" />
        </div>
        <div className="space-y-2 px-2 pb-2.5 pt-2">
          <div className="grid grid-cols-4 gap-1.5">
            {icons.map((color) => (
              <span
                key={color}
                className={cn("aspect-square rounded-[0.45rem]", color)}
              />
            ))}
            <span className="aspect-square overflow-hidden rounded-[0.45rem] bg-white">
              <BrandLogoMark size={22} className="h-full w-full" />
            </span>
            <span className="aspect-square rounded-[0.45rem] bg-[#8e8e93]" />
          </div>
          <div className="flex justify-center gap-1.5 rounded-[0.65rem] bg-white/50 px-1.5 py-1">
            <span className="h-4 w-4 rounded-[0.35rem] bg-[#007aff]" />
            <span className="h-4 w-4 rounded-[0.35rem] bg-[#34c759]" />
            <span className="h-4 w-4 rounded-[0.35rem] bg-[#ff3b30]" />
          </div>
        </div>
      </div>

      <div className="absolute -right-1 bottom-1 flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full border-[3px] border-white bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[0.85rem] bg-white shadow-sm ring-1 ring-stone-200">
          <BrandLogoMark size={44} />
        </span>
        <span className="mt-1 max-w-[76px] truncate text-[9px] font-semibold text-stone-800">
          {productName}
        </span>
      </div>
    </div>
  );
}

function SafariBottomBarMock() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-[#f2f2f7] px-3 py-2.5 shadow-inner"
      aria-hidden="true"
    >
      <div className="flex items-center justify-around text-[#007AFF]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M15 5 8 12l7 7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-35" fill="none">
          <path
            d="M9 5l7 7-7 7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="relative flex h-9 w-9 items-center justify-center">
          <TapRing />
          <IosShareIcon className="h-6 w-6" />
        </span>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M6 19V8.5A1.5 1.5 0 0 1 7.5 7H18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M8 19h10.5A1.5 1.5 0 0 0 20 17.5V7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <rect
            x="4"
            y="6"
            width="11"
            height="12"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect
            x="9"
            y="4"
            width="11"
            height="12"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}

function SafariTopBarMock() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-[#f2f2f7] px-2.5 py-2 shadow-inner"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-[#007AFF]">Aa</span>
        <div className="flex h-8 min-w-0 flex-1 items-center justify-center rounded-lg bg-white text-[11px] font-medium text-stone-500">
          shuleos.app
        </div>
        <span className="relative flex h-9 w-9 items-center justify-center text-[#007AFF]">
          <TapRing />
          <IosShareIcon className="h-6 w-6" />
        </span>
      </div>
    </div>
  );
}

function ShareSheetMock({ addLabel }: { addLabel: string }) {
  const rows = [
    { label: "Add to Favorites", muted: true },
    { label: "Find on Page", muted: true },
  ];

  return (
    <div
      className="overflow-hidden rounded-2xl bg-[#f2f2f7] p-2 shadow-inner"
      aria-hidden="true"
    >
      <div className="overflow-hidden rounded-xl bg-white">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border-b border-stone-100 px-3 py-2.5 text-[13px] text-stone-400"
          >
            <span>{row.label}</span>
            <span className="text-stone-300">?</span>
          </div>
        ))}
        <div className="relative flex items-center justify-between px-3 py-2.5">
          <span className="absolute inset-1 rounded-lg border-[2.5px] border-[#FF3B30]" />
          <span className="relative text-[13px] font-semibold text-stone-900">
            {addLabel}
          </span>
          <IosAddSquareIcon className="relative h-5 w-5 text-stone-800" />
        </div>
      </div>
    </div>
  );
}

function StepRow({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 text-[12px] font-bold text-stone-700 dark:bg-stone-700 dark:text-stone-100">
          {number}
        </span>
        <p className="text-sm font-semibold text-mkt-ink">{title}</p>
      </div>
      {children}
    </div>
  );
}

export function IosAddToHomeScreenGuide({
  variant = "embedded",
  className,
}: IosAddToHomeScreenGuideProps) {
  const t = useTranslations("pwa.iosGuide");
  const { inAppBrowser, sharePlacement } = usePwaInstall();
  const productName = companyIdentity.productName;

  return (
    <div className={cn("space-y-5", className)}>
      {variant === "full" ? (
        <div className="text-center">
          <h2 className="font-display text-2xl tracking-tight text-mkt-ink">
            {t("title", { productName })}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-mkt-ink/60">
            {t("subtitle")}
          </p>
        </div>
      ) : null}

      {inAppBrowser ? (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-mkt-ink">{t("inAppTitle")}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-mkt-ink/65">
            {t("inAppBody", { productName })}
          </p>
        </div>
      ) : (
        <>
          <HomeScreenHero productName={productName} />

          <StepRow
            number={1}
            title={
              sharePlacement === "bottom"
                ? t("step1TitleBottom")
                : t("step1TitleTop")
            }
          >
            {sharePlacement === "bottom" ? (
              <SafariBottomBarMock />
            ) : (
              <SafariTopBarMock />
            )}
          </StepRow>

          <StepRow number={2} title={t("step2Title")}>
            <ShareSheetMock addLabel={t("addToHomeScreen")} />
          </StepRow>

          <p className="text-center text-xs leading-relaxed text-mkt-ink/50">
            {t("step3Hint", { productName })}
          </p>
        </>
      )}
    </div>
  );
}
