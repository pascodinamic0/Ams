"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type BrandLogoMarkProps = {
  size?: number;
  className?: string;
  /** Soft glow for dark / hero backgrounds */
  glow?: boolean;
};

/**
 * ShuleOS crest: open book, golden star, and orbital rings.
 * Inline SVG so gradients stay crisp at every size.
 */
export function BrandLogoMark({
  size = 40,
  className,
  glow = false,
}: BrandLogoMarkProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
      className={cn(
        "shrink-0",
        glow &&
          "drop-shadow-[0_0_16px_rgba(232,145,45,0.35)] drop-shadow-[0_4px_12px_rgba(10,47,44,0.28)]",
        className
      )}
    >
      <defs>
        <linearGradient id={`${uid}-star`} x1="64" y1="26" x2="64" y2="78">
          <stop offset="0%" stopColor="#FFE49A" />
          <stop offset="42%" stopColor="#F6B23A" />
          <stop offset="100%" stopColor="#E07A14" />
        </linearGradient>
        <radialGradient
          id={`${uid}-star-core`}
          cx="64"
          cy="52"
          r="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FFF6C8" />
          <stop offset="55%" stopColor="#F7C14A" />
          <stop offset="100%" stopColor="#E8912D" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-book`} x1="28" y1="70" x2="100" y2="104">
          <stop offset="0%" stopColor="#0A3A36" />
          <stop offset="55%" stopColor="#0F4F49" />
          <stop offset="100%" stopColor="#165E56" />
        </linearGradient>
      </defs>

      <path
        d="M28 62C28 36.5 48.5 20 64 20C79.5 20 100 36.5 100 62"
        stroke="#2A3230"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="93.5" cy="34.5" r="3.2" fill="#2A3230" />

      <path
        d="M38.5 66C42 44 84 36 92 54"
        stroke="#0F4F49"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M64 98C52 90 34 86 22 88C22 74 34 64 48 62C54 61 60 62 64 66C68 62 74 61 80 62C94 64 106 74 106 88C94 86 76 90 64 98Z"
        fill={`url(#${uid}-book)`}
      />
      <path
        d="M64 66V98"
        stroke="#08332F"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M30 78C40 74 52 74 64 82"
        stroke="#D7E7E4"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M98 78C88 74 76 74 64 82"
        stroke="#D7E7E4"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />

      <circle cx="64" cy="52" r="18" fill={`url(#${uid}-star-core)`} />
      <path
        d="M64 28L69.2 46.8L88 52L69.2 57.2L64 76L58.8 57.2L40 52L58.8 46.8Z"
        fill={`url(#${uid}-star)`}
      />
      <path
        d="M64 36L66.6 47.4L78 50L66.6 52.6L64 64L61.4 52.6L50 50L61.4 47.4Z"
        fill="#FFF4C2"
        opacity="0.9"
      />

      <path
        d="M36 58C44 72 78 78 91.5 62"
        stroke="#0F4F49"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
