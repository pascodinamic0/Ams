"use client";

import Link from "next/link";
import { ExternalLink, Check } from "lucide-react";
import { TemplateLivePreview } from "./template-live-preview";
import {
  WEBSITE_TEMPLATES,
  type WebsiteTemplateId,
} from "@/lib/schools/website-templates";

type TemplatePickerProps = {
  value: WebsiteTemplateId;
  onChange: (template: WebsiteTemplateId) => void;
  primaryColor?: string;
  secondaryColor?: string;
  showOnboardingLinks?: boolean;
};

export function TemplatePicker({
  value,
  onChange,
  primaryColor,
  secondaryColor,
  showOnboardingLinks = false,
}: TemplatePickerProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {WEBSITE_TEMPLATES.map((template) => {
        const selected = value === template.id;
        return (
          <div
            key={template.id}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white transition-all dark:bg-stone-950 ${
              selected
                ? "border-primary shadow-lg shadow-primary/10 dark:border-primary"
                : "border-stone-200 hover:border-stone-300 dark:border-stone-800 dark:hover:border-stone-700"
            }`}
          >
            <button
              type="button"
              onClick={() => onChange(template.id)}
              className="flex flex-1 flex-col text-left"
            >
              <div className="relative p-4 pb-0">
                <TemplateLivePreview template={template.id} />
                {selected && (
                  <span className="absolute right-6 top-6 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                      {template.name}
                    </h3>
                    <p className="text-sm text-primary dark:text-primary">
                      {template.tagline}
                    </p>
                  </div>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {template.description}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {template.features.map((feature) => (
                    <li
                      key={feature}
                      className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </button>

            <div className="flex border-t border-zinc-100 dark:border-stone-800">
              <Link
                href={template.previewPath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-zinc-100"
              >
                Preview live
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              {showOnboardingLinks && (
                <Link
                  href={template.onboardingPath}
                  className="flex flex-1 items-center justify-center border-l border-zinc-100 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary-light dark:border-stone-800 dark:text-primary dark:hover:bg-primary-light/40"
                >
                  Use template
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
