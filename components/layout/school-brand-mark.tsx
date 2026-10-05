import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SchoolShellBranding } from "@/lib/schools/shell-branding";

function schoolInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

type SchoolBrandMarkProps = {
  branding: SchoolShellBranding;
  href: string;
  variant?: "sidebar" | "compact";
  className?: string;
};

export function SchoolBrandMark({
  branding,
  href,
  variant = "sidebar",
  className,
}: SchoolBrandMarkProps) {
  const isCompact = variant === "compact";
  const markSize = isCompact ? 32 : 32;
  const initials = schoolInitials(branding.name);

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-w-0 max-w-full items-center gap-2.5 transition-opacity hover:opacity-90",
        className
      )}
      aria-label={branding.name}
    >
      {branding.logoUrl ? (
        <span
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white ring-1 ring-stone-200 dark:ring-stone-700",
            isCompact ? "h-8 w-8 p-0.5" : "h-8 w-8 p-0.5"
          )}
        >
          <img
            src={branding.logoUrl}
            alt=""
            className="h-full w-full object-contain"
            width={markSize}
            height={markSize}
          />
        </span>
      ) : (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-[10px] bg-teal-700 text-xs font-bold text-white dark:bg-teal-600",
            isCompact ? "h-8 w-8" : "h-8 w-8"
          )}
          aria-hidden
        >
          {initials}
        </span>
      )}
      <span
        className={cn(
          "min-w-0 truncate font-bold text-stone-900 dark:text-white",
          isCompact ? "text-sm" : "text-base"
        )}
      >
        {branding.name}
      </span>
    </Link>
  );
}
