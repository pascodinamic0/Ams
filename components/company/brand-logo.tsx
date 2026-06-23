import Image from "next/image";
import { companyIdentity } from "@/lib/company/identity";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  size?: number;
};

export function BrandLogo({
  className,
  imageClassName,
  showWordmark = true,
  wordmarkClassName,
  size = 40,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/images/shuleos-logo.svg"
        alt={`${companyIdentity.productName} logo`}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-xl shadow-lg shadow-indigo-600/20", imageClassName)}
        priority
      />
      {showWordmark && (
        <span className={cn("text-xl font-black tracking-tight", wordmarkClassName)}>
          {companyIdentity.productName}
        </span>
      )}
    </span>
  );
}
