import Image from "next/image";
import { companyIdentity } from "@/lib/company/identity";
import { cn } from "@/lib/utils";

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
  const wordmarkColor =
    variant === "light"
      ? "text-white"
      : variant === "dark"
        ? "text-stone-900 dark:text-white"
        : "text-stone-900 dark:text-white";

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/images/shuleos-logo.svg"
        alt={`${companyIdentity.productName} logo`}
        width={size}
        height={size}
        className={cn(
          "shrink-0 rounded-xl shadow-lg shadow-primary/20",
          imageClassName
        )}
        priority
      />
      {showWordmark && (
        <span
          className={cn(
            "text-xl font-extrabold tracking-tight",
            wordmarkColor,
            wordmarkClassName
          )}
        >
          <span>Shule</span>
          <span className="text-accent">OS</span>
        </span>
      )}
    </span>
  );
}
