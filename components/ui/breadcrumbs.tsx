"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function segmentToLabel(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface BreadcrumbsProps {
  customLabels?: Record<string, string>;
}

export function Breadcrumbs({ customLabels = {} }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const items = segments.map((segment, i) => {
    const href = `/${segments.slice(0, i + 1).join("/")}`;
    const label = customLabels[segment] ?? customLabels[href] ?? segmentToLabel(segment);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      <Link
        href="/"
        className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
      >
        Home
      </Link>
      {items.map((item) => (
        <span key={item.href} className="flex items-center gap-2">
          <span className="text-stone-400">/</span>
          {item.isLast ? (
            <span className="font-medium text-stone-900 dark:text-stone-100">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
