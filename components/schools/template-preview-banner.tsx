"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { WebsiteTemplateId } from "@/lib/schools/website-templates";

const dismissKey = (template: WebsiteTemplateId) =>
  `shuleos-template-preview-banner-${template}`;

export function TemplatePreviewBanner({ template }: { template: WebsiteTemplateId }) {
  const t = useTranslations("schools.chrome");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(sessionStorage.getItem(dismissKey(template)) !== "1");
  }, [template]);

  function dismiss() {
    sessionStorage.setItem(dismissKey(template), "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="relative z-40 border-b px-6 py-3 text-center text-sm"
      style={{
        backgroundColor: "#f7f4ea",
        borderColor: "#e7d9a8",
        color: "#1a2b56",
      }}
    >
      <div className="mx-auto flex max-w-4xl items-start justify-center gap-3 pr-8">
        <p>
          {t("templatePreviewNotice")}{" "}
          <Link
            href={`/admin/schools/new?template=${template}`}
            className="font-semibold underline underline-offset-2"
          >
            {t("useThisDesign")}
          </Link>
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#1a2b56]/60 hover:bg-[#1a2b56]/10 hover:text-[#1a2b56]"
        aria-label={t("dismissPreviewNotice")}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
