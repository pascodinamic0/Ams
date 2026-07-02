"use client";

import { useState } from "react";
import type { WebsiteTemplateId } from "@/lib/schools/website-templates";

type TemplateLivePreviewProps = {
  template: WebsiteTemplateId;
  className?: string;
};

export function TemplateLivePreview({ template, className = "" }: TemplateLivePreviewProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-inner dark:border-stone-700 dark:bg-stone-800 ${className}`}
    >
      <div className="flex items-center gap-1 border-b border-stone-200 bg-white px-2 py-1.5 dark:border-stone-700 dark:bg-stone-900">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </div>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-zinc-700" />
        )}
        <iframe
          src={`/schools/templates/preview/${template}?embed=1`}
          title={`${template} template preview`}
          className={`absolute left-0 top-0 border-0 transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            width: "400%",
            height: "400%",
            transform: "scale(0.25)",
            transformOrigin: "top left",
          }}
          loading="lazy"
          tabIndex={-1}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
