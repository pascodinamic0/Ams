"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";

interface CopyableBadgeProps {
  value: string;
  label?: string;
  variant?: "badge" | "button";
}

export function CopyableBadge({
  value,
  label,
  variant = "badge",
}: CopyableBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const baseClass =
    variant === "badge"
      ? "inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
      : "inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700";

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`${baseClass} hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer`}
      title="Copy to clipboard"
    >
      <span>{label ?? value}</span>
      {copied ? (
        <svg className="h-3.5 w-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}
