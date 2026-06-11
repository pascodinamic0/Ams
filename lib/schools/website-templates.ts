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
    tagline: "Bold & contemporary",
    description:
      "Large hero, gradient accents, and card-based sections. Ideal for progressive schools that want a confident digital presence.",
    features: ["Gradient hero", "Feature cards", "Strong CTAs"],
    defaultPrimary: "#4f46e5",
    defaultSecondary: "#7c3aed",
    previewPath: "/schools/templates/preview/modern",
    onboardingPath: "/admin/schools/new?template=modern",
  },
  {
    id: "classic",
    name: "Classic",
    tagline: "Timeless & trusted",
    description:
      "Structured layout with serif headings and formal borders. Perfect for established institutions with a heritage brand.",
    features: ["Serif typography", "Formal grid", "Centered header"],
    defaultPrimary: "#1e3a8a",
    defaultSecondary: "#1e40af",
    previewPath: "/schools/templates/preview/classic",
    onboardingPath: "/admin/schools/new?template=classic",
  },
  {
    id: "minimal",
    name: "Minimal",
    tagline: "Clean & focused",
    description:
      "Whitespace-first design with subtle typography. Best for boutique academies and schools that value clarity over clutter.",
    features: ["Whitespace", "Light typography", "Single-column flow"],
    defaultPrimary: "#18181b",
    defaultSecondary: "#3f3f46",
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
