import { cn } from "@/lib/utils";
import { BrandLogoMark } from "@/components/company/brand-logo-mark";

type ShuleOsMarkProps = {
  size?: number;
  className?: string;
};

/** Brand mark only (book + orbit + star), no wordmark. */
export function ShuleOsMark({ size = 40, className }: ShuleOsMarkProps) {
  return <BrandLogoMark size={size} className={cn("rounded-lg bg-white", className)} />;
}
