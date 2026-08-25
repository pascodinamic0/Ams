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
      className={cn("group/logo inline-flex items-center gap-3", className)}
      aria-label={companyIdentity.productName}
    >
      <span
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden rounded-[13px] bg-white transition-transform duration-300 ease-out group-hover/logo:scale-[1.04]",
          "ring-1",
          isLight ? "ring-white/25" : "ring-teal-900/10 dark:ring-white/15",
          imageClassName
        )}
      >
        <BrandLogoMark size={size} glow={isLight} />
      </span>

      {showWordmark && (
        <span
          aria-hidden="true"
          className={cn(
            "flex items-baseline gap-0.5 text-xl font-extrabold tracking-tight",
            wordmarkClassName
          )}
        >
          <span
            className={cn(
              isLight ? "text-white" : "text-[#02423B] dark:text-teal-50"
            )}
          >
            Shule
          </span>
          <span
            className={cn(
              isLight
                ? "text-amber-300"
                : "bg-gradient-to-br from-amber-400 via-[#ECA523] to-amber-600 bg-clip-text text-transparent"
            )}
          >
            OS
          </span>
        </span>
      )}
    </span>
  );
}
