"use client";

import { cn } from "@/lib/utils";

type ShuleOsMarkProps = {
  size?: number;
  className?: string;
};

/** Brand mark only (book + head + bookmark) with no teal plate. */
export function ShuleOsMark({ size = 40, className }: ShuleOsMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path
        d="M9 20
           C9 15.5 12.5 12 17.5 12
           H20.5
           C22.5 12 23.5 13.8 24 16
           C24.5 13.8 25.5 12 27.5 12
           H30.5
           C35.5 12 39 15.5 39 20
           V30
           C39 34.5 35.5 38 30.5 38
           H27.5
           C25.5 38 24.5 36.2 24 34
           C23.5 36.2 22.5 38 20.5 38
           H17.5
           C12.5 38 9 34.5 9 30
           Z"
        stroke="white"
        strokeWidth="4.25"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="24" cy="11" r="5.25" fill="#f97316" />
      <path d="M21.25 35.5 H26.75 V44 L24 41.25 L21.25 44 Z" fill="#2dd4bf" />
    </svg>
  );
}
