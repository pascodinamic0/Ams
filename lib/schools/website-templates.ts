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
    tagline: "Confident campus presence",
    description:
      "Full-bleed media hero, mission band, and photo program tiles. Built for schools that need parents to act before seats disappear.",
    features: ["Media-first hero", "Mission band", "Photo program grid"],
    defaultPrimary: "#0d9488",
    defaultSecondary: "#0f766e",
    previewPath: "/schools/templates/preview/modern",
    onboardingPath: "/admin/schools/new?template=modern",
  },
  {
    id: "classic",
    name: "Classic",
    tagline: "International school presence",
    description:
      "Inspired by premium campus sites: navy mission blocks, gold accent line, ghost Apply CTAs, and hover photo program cards.",
    features: ["Navy + gold accents", "Mission block", "Interactive photo cards"],
    defaultPrimary: "#1a2b56",
    defaultSecondary: "#c9a227",
    previewPath: "/schools/templates/preview/classic",
    onboardingPath: "/admin/schools/new?template=classic",
  },
  {
    id: "minimal",
    name: "Minimal",
    tagline: "Quiet and decisive",
    description:
      "Editorial restraint with a full-bleed hero, thin accent line, and focused actions. Best for boutique schools that want clarity.",
    features: ["Editorial type", "Accent line", "Focused pages"],
    defaultPrimary: "#1a2b56",
    defaultSecondary: "#c9a227",
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
