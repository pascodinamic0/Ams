import type { SchoolRow } from "@/lib/db/schools";

export const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1600&q=80";

export const DEFAULT_PROGRAM_IMAGES = [
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80",
];

export const DEFAULT_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
  "https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
  "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
];

export type WebsiteProgram = {
  title: string;
  description: string;
  image_url: string;
};

export type WebsiteStat = {
  label: string;
  value: string;
};

export type WebsiteGalleryImage = {
  url: string;
  caption?: string;
};

export type SchoolWebsiteContent = {
  hero_title?: string;
  hero_subtitle?: string;
  programs?: WebsiteProgram[];
  stats?: WebsiteStat[];
  gallery?: WebsiteGalleryImage[];
  footer_tagline?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  /** Google Maps share, place, or embed URL shown on the public site. */
  map_url?: string;
};

export type ResolvedSchoolWebsite = {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  about: string;
  programs: WebsiteProgram[];
  stats: WebsiteStat[];
  gallery: WebsiteGalleryImage[];
  footerTagline: string;
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  mapUrl: string;
};

export function parseWebsiteContent(raw: unknown): SchoolWebsiteContent {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  return raw as SchoolWebsiteContent;
}

/** Minimal content for newly created schools — no demo stats, programs, or gallery. */
export function getEmptyWebsiteContent(schoolName: string): SchoolWebsiteContent {
  return {
    hero_title: schoolName,
    hero_subtitle: "",
    programs: [],
    stats: [],
    gallery: [],
    footer_tagline: "",
  };
}

/** Rich sample content for template previews and marketing demos only. */
export function getPreviewWebsiteContent(schoolName: string): SchoolWebsiteContent {
  return {
    hero_title: `A place at ${schoolName} still open — for now`,
    hero_subtitle:
      "For families choosing a trusted school, delay is the costliest option. See programs, campus life, and admissions before seats fill.",
    programs: [
      {
        title: "Community",
        description:
          "A welcoming campus where students, families, and teachers grow together across cultures and grades.",
        image_url: DEFAULT_PROGRAM_IMAGES[0],
      },
      {
        title: "Early years",
        description:
          "Play-based learning that builds curiosity, confidence, and the habits that carry into primary school.",
        image_url: DEFAULT_PROGRAM_IMAGES[1],
      },
      {
        title: "Primary & middle",
        description:
          "Strong academics with character, inquiry, and support through the years that shape identity.",
        image_url: DEFAULT_GALLERY_IMAGES[0],
      },
      {
        title: "Secondary",
        description:
          "Rigorous pathways that prepare students for university and life beyond the classroom.",
        image_url: DEFAULT_GALLERY_IMAGES[1],
      },
      {
        title: "Campus",
        description:
          "Spaces for learning, sport, arts, and community — the daily environment families come to see.",
        image_url: DEFAULT_GALLERY_IMAGES[2],
      },
      {
        title: "Student life",
        description:
          "Clubs, athletics, and leadership moments that make school more than a timetable.",
        image_url: DEFAULT_GALLERY_IMAGES[3],
      },
    ],
    stats: [
      { label: "Students", value: "1,200+" },
      { label: "Teachers", value: "85" },
      { label: "Years", value: "25+" },
      { label: "Graduation rate", value: "98%" },
    ],
    gallery: DEFAULT_GALLERY_IMAGES.map((url, i) => ({
      url,
      caption: ["Campus", "Classroom", "Library", "Sports"][i],
    })),
    footer_tagline: "Excellence · Integrity · Inclusivity",
    map_url: "https://www.google.com/maps?q=42+Learning+Lane,+Greenfield",
  };
}

/** @deprecated Use getPreviewWebsiteContent for demos or getEmptyWebsiteContent for new schools. */
export function getDefaultWebsiteContent(schoolName: string): SchoolWebsiteContent {
  return getPreviewWebsiteContent(schoolName);
}

export function resolveSchoolWebsite(school: SchoolRow): ResolvedSchoolWebsite {
  const content = parseWebsiteContent(school.website_content);

  return {
    heroTitle: content.hero_title?.trim() || school.name,
    heroSubtitle: content.hero_subtitle?.trim() || "",
    heroImage: school.cover_image_url ?? DEFAULT_HERO_IMAGE,
    about: school.about?.trim() || "",
    programs: content.programs ?? [],
    stats: content.stats ?? [],
    gallery: content.gallery ?? [],
    footerTagline: content.footer_tagline?.trim() || "",
    social: {
      facebook: content.social_facebook,
      instagram: content.social_instagram,
      twitter: content.social_twitter,
    },
    mapUrl: content.map_url?.trim() || "",
  };
}
