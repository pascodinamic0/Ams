"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const ChartImpl = dynamic(
  () => import("@/components/ui/chart").then((mod) => mod.Chart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse rounded-lg border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900" />
    ),
  }
);

export function Chart(props: ComponentProps<typeof ChartImpl>) {
  return <ChartImpl {...props} />;
}
