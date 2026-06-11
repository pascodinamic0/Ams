"use client";

import { useState } from "react";
import { TemplatePicker } from "@/components/schools/template-picker";
import type { WebsiteTemplateId } from "@/lib/schools/website-templates";

export function WebsiteTemplatesGallery() {
  const [selected, setSelected] = useState<WebsiteTemplateId>("modern");

  return (
    <TemplatePicker
      value={selected}
      onChange={setSelected}
      showOnboardingLinks
    />
  );
}
