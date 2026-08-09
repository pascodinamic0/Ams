import { companyIdentity } from "@/lib/company/identity";
import { cn } from "@/lib/utils";
import { BrandLogoMark } from "@/components/company/brand-logo-mark";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  showWordmark?: boolean;
  showTagline?: boolean;
  wordmarkClassName?: string;
  taglineClassName?: string;
  size?: number;
  variant?: "default" | "light" | "dark";
  /** Stack mark above wordmark (splash / lockup) instead of inline */
  stacked?: boolean;
};

export function BrandLogo({
  className,
  imageClassName,
  showWordmark = true,
  showTagline = false,
  wordmarkClassName,
  taglineClassName,
  size = 40,
  variant = "default",
  stacked = false,
}: BrandLogoProps) {
  const isLight = variant === "light";

  return (
    <span
      className={cn(
        "group/logo inline-flex",
        stacked
          ? "flex-col items-center gap-4 text-center"
          : "items-center gap-3",
        className
      )}
    >
      <span className={cn("relative inline-flex shrink-0", imageClassName)}>
        <BrandLogoMark size={size} glow={isLight} />
      </span>

      {(showWordmark || showTagline) && (
        <span
          className={cn(
            "flex flex-col",
            stacked ? "items-center gap-2" : "items-start gap-0.5"
          )}
        >
          {showWordmark && (
            <span
              className={cn(
                "flex items-baseline gap-0 text-xl font-extrabold tracking-tight",
                wordmarkClassName
              )}
            >
              <span
                className={cn(
                  isLight ? "text-white" : "text-[#0A2F2C] dark:text-teal-50"
                )}
              >
                Shule
              </span>
              <span
                className={cn(
                  isLight ? "text-amber-300" : "text-[#E8912D]"
                )}
              >
                OS
              </span>
              <span className="sr-only">{companyIdentity.productName}</span>
            </span>
          )}

          {showTagline && (
            <span
              className={cn(
                "text-[0.65rem] font-medium uppercase tracking-[0.28em]",
                isLight ? "text-white/75" : "text-stone-500 dark:text-stone-400",
                taglineClassName
              )}
            >
              {companyIdentity.logoTagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
