import { cn } from "@/lib/utils";
import { brandMarkPath } from "@/lib/pwa/assets";

type BrandLogoMarkProps = {
  size?: number;
  className?: string;
  /** Soft outer glow — best on dark / hero backgrounds */
  glow?: boolean;
};

/**
 * Official ShuleOS emblem: open book, orbit, and golden star.
 * Raster mark so the lockup matches the provided artwork at every size.
 */
export function BrandLogoMark({
  size = 40,
  className,
  glow = false,
}: BrandLogoMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- versioned public asset; avoids next/image query-string caching
    <img
      src={brandMarkPath}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      draggable={false}
      className={cn(
        "shrink-0 object-contain",
        glow && "drop-shadow-[0_0_14px_rgba(255,255,255,0.35)]",
        className
      )}
    />
  );
}
