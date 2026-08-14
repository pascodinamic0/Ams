import type { Locale } from "@/i18n/config";

export type BlogCategory =
  | "guides"
  | "fees"
  | "attendance"
  | "drc"
  | "francais"
  | "conversion";

export type BlogFaqItem = {
  question: string;
  answer: string;
};

export type BlogFact = {
  value: string;
  label: string;
  source?: string;
};

export type BlogLabeledItem = {
  title: string;
  detail: string;
};

export type BlogSection = {
  title: string;
  body?: string[];
  costLabel?: string;
  cost?: string;
  fixLabel?: string;
  fix?: string;
  whoLabel?: string;
  who?: string;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
};

/** Static post definition (locale-fixed for SEO). */
export type BlogPostContent = {
  slug: string;
  locale: Locale;
  category: BlogCategory;
  focusKeyword: string;
  secondaryKeywords: string[];
  relatedSlugs: string[];
  relatedModules: string[];
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  metaDescription: string;
  coverImage: string;
  coverImageAlt?: string;
  intro: string[];
  factsTitle?: string;
  facts?: BlogFact[];
  flowTitle?: string;
  flowBeforeLabel?: string;
  flowAfterLabel?: string;
  flowBefore?: string[];
  flowAfter?: string[];
  termCostTitle?: string;
  termCostIntro?: string;
  termCostItems?: string[];
  modulesTitle?: string;
  modulesIntro?: string;
  modules?: BlogLabeledItem[];
  sections: BlogSection[];
  faq?: BlogFaqItem[];
  midCtaTitle: string;
  midCtaBody: string;
  midCtaPrimary: string;
  midCtaSecondary: string;
  closing: string[];
  sourcesLabel?: string;
  sources?: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  ctaTertiary: string;
  relatedLabel: string;
  relatedFinance: string;
  relatedAcademic: string;
  relatedPortals: string;
};

export type BlogPost = BlogPostContent;

export type BlogPostMeta = Pick<
  BlogPostContent,
  | "slug"
  | "locale"
  | "category"
  | "focusKeyword"
  | "secondaryKeywords"
  | "relatedSlugs"
  | "relatedModules"
  | "date"
  | "title"
  | "excerpt"
  | "readTime"
  | "coverImage"
  | "coverImageAlt"
>;

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, { en: string; fr: string }> = {
  guides: { en: "Guides", fr: "Guides" },
  fees: { en: "Fees", fr: "Frais" },
  attendance: { en: "Attendance", fr: "Présences" },
  drc: { en: "DRC", fr: "RDC" },
  francais: { en: "Français", fr: "Français" },
  conversion: { en: "School stories", fr: "Écoles" },
};
