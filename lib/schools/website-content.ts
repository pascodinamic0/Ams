import type { SchoolRow } from "@/lib/db/schools";

export const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=80";

export const DEFAULT_PROGRAM_IMAGES = [
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  "https://images.unsplash.com/photo-1427504494784-3a9ca7044f45?w=800&q=80",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
];

export const DEFAULT_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
  "https://images.unsplash.com/photo-1571260899304-425eee4c376e?w=800&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3c?w=800&q=80",
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
    hero_title: `Welcome to ${schoolName}`,
    hero_subtitle:
      "Inspiring excellence, creativity, and character in every student.",
    programs: [
      {
        title: "STEM & Sciences",
        description:
          "Hands-on labs, robotics, and inquiry-based learning from early grades through graduation.",
        image_url: DEFAULT_PROGRAM_IMAGES[0],
      },
      {
        title: "Arts & Culture",
        description:
          "Music, visual arts, drama, and cultural programs that celebrate creativity and expression.",
        image_url: DEFAULT_PROGRAM_IMAGES[1],
      },
      {
        title: "Sports & Leadership",
        description:
          "Competitive athletics, team building, and leadership development on and off the field.",
        image_url: DEFAULT_PROGRAM_IMAGES[2],
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
    footer_tagline: "Shaping tomorrow's leaders today.",
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
  };
}
