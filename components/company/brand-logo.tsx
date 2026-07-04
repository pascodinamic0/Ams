import { companyIdentity } from "@/lib/company/identity";
import { cn } from "@/lib/utils";
import { BrandLogoMark } from "@/components/company/brand-logo-mark";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  size?: number;
  variant?: "default" | "light" | "dark";
};

export function BrandLogo({
  className,
  imageClassName,
  showWordmark = true,
  wordmarkClassName,
  size = 40,
  variant = "default",
}: BrandLogoProps) {
  const isLight = variant === "light";

  return (
    <span
      className={cn(
        "group/logo inline-flex items-center gap-3",
        className
      )}
    >
      <span
        className={cn(
          "relative inline-flex shrink-0 rounded-[13px] transition-transform duration-300 ease-out group-hover/logo:scale-[1.04]",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-[13px]",
          isLight
            ? "before:bg-teal-400/20 before:opacity-100 before:blur-md"
            : "before:bg-teal-500/10 before:opacity-0 before:blur-md group-hover/logo:before:opacity-100",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[13px] after:ring-1",
          isLight
            ? "after:ring-white/25"
            : "after:ring-teal-900/10 dark:after:ring-teal-400/15",
          imageClassName
        )}
      >
        <BrandLogoMark size={size} glow={isLight} />
      </span>

      {showWordmark && (
        <span
          className={cn(
            "flex items-baseline gap-0.5 text-xl font-extrabold tracking-tight",
            wordmarkClassName
          )}
        >
          <span
            className={cn(
              isLight
                ? "text-white"
                : "bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 bg-clip-text text-transparent dark:from-white dark:via-teal-50 dark:to-white"
            )}
          >
            Shule
          </span>
          <span
            className={cn(
              "relative",
              isLight
                ? "text-amber-300"
                : "bg-gradient-to-br from-amber-500 via-amber-400 to-amber-600 bg-clip-text text-transparent"
            )}
          >
            OS
            <span
              aria-hidden
              className={cn(
                "absolute -right-1 -top-0.5 h-1.5 w-1.5 rounded-full",
                isLight ? "bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]" : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.75)]"
              )}
            />
          </span>
          <span className="sr-only">{companyIdentity.productName}</span>
        </span>
      )}
    </span>
  );
}
