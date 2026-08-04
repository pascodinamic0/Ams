export const WEBSITE_TEMPLATE_IDS = ["modern", "classic", "minimal"] as const;

export type WebsiteTemplateId = (typeof WEBSITE_TEMPLATE_IDS)[number];

export type WebsiteTemplate = {
  id: WebsiteTemplateId;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  defaultPrimary: string;
  defaultSecondary: string;
  /** Live demo - no school account required */
  previewPath: string;
  /** Superadmin onboarding with this template pre-selected */
  onboardingPath: string;
};

export const WEBSITE_TEMPLATES: WebsiteTemplate[] = [
  {
    id: "modern",
    name: "Modern",
    tagline: "Bold campus presence",
    description:
      "Full-bleed hero, strong school branding, and clear enrollment pressure. Built for schools that need parents to act before seats disappear.",
    features: ["Full-bleed hero", "Brand-first landing", "Enrollment CTAs"],
    defaultPrimary: "#0d9488",
    defaultSecondary: "#0f766e",
    previewPath: "/schools/templates/preview/modern",
    onboardingPath: "/admin/schools/new?template=modern",
  },
  {
    id: "classic",
    name: "Classic",
    tagline: "Trusted institution",
    description:
      "Serif typography and formal structure without looking dated. Ideal for established schools that still need parents to apply this term.",
    features: ["Real serif type", "Formal layout", "Heritage feel"],
    defaultPrimary: "#1e3a8a",
    defaultSecondary: "#1e40af",
    previewPath: "/schools/templates/preview/classic",
    onboardingPath: "/admin/schools/new?template=classic",
  },
  {
    id: "minimal",
    name: "Minimal",
    tagline: "Quiet and decisive",
    description:
      "Editorial whitespace with a full-bleed hero and focused actions. Best for boutique schools that want clarity without clutter.",
    features: ["Editorial type", "Atmospheric hero", "Focused pages"],
    defaultPrimary: "#1f2937",
    defaultSecondary: "#4b5563",
    previewPath: "/schools/templates/preview/minimal",
    onboardingPath: "/admin/schools/new?template=minimal",
  },
];

export function getWebsiteTemplate(id: string): WebsiteTemplate | undefined {
  return WEBSITE_TEMPLATES.find((t) => t.id === id);
}

export function isWebsiteTemplateId(id: string): id is WebsiteTemplateId {
  return WEBSITE_TEMPLATE_IDS.includes(id as WebsiteTemplateId);
}
