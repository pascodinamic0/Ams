import {
  getStaticBlogPost,
  getStaticBlogPostSlugs,
  STATIC_BLOG_POSTS,
} from "@/content/blog/index";
import type {
  BlogCategory,
  BlogFact,
  BlogLabeledItem,
  BlogPost,
  BlogPostMeta,
  BlogSection,
} from "@/lib/company/blog-types";

export type {
  BlogCategory,
  BlogFact,
  BlogFaqItem,
  BlogLabeledItem,
  BlogPost,
  BlogPostMeta,
  BlogSection,
} from "@/lib/company/blog-types";

export { BLOG_CATEGORY_LABELS } from "@/lib/company/blog-types";

/** Legacy posts still loaded from next-intl (bilingual via cookie). */
export const LEGACY_I18N_BLOG_SLUGS = [
  "why-every-kinshasa-school-should-run-on-shuleos",
  "every-way-shuleos-stops-the-leaks",
] as const;

export type LegacyBlogPostSlug = (typeof LEGACY_I18N_BLOG_SLUGS)[number];

const LEGACY_COVER_IMAGES: Record<LegacyBlogPostSlug, string> = {
  "why-every-kinshasa-school-should-run-on-shuleos":
    "/images/blog/why-every-kinshasa-school-should-run-on-shuleos.jpg",
  "every-way-shuleos-stops-the-leaks":
    "/images/blog/every-way-shuleos-stops-the-leaks.jpg",
};

const LEGACY_SECTION_IMAGES: Record<LegacyBlogPostSlug, (string | undefined)[]> = {
  "why-every-kinshasa-school-should-run-on-shuleos": [
    "/images/blog/kinshasa-private-school-city.jpg",
    "/images/blog/kinshasa-fee-collection.jpg",
    "/images/blog/kinshasa-parent-portal.jpg",
    "/images/blog/kinshasa-report-cards.jpg",
    "/images/blog/kinshasa-offline-attendance.jpg",
    "/images/blog/kinshasa-school-website.jpg",
    "/images/blog/kinshasa-director-dashboard.jpg",
    "/images/blog/kinshasa-local-support.jpg",
  ],
  "every-way-shuleos-stops-the-leaks": [],
};

const LEGACY_META: Record<
  LegacyBlogPostSlug,
  Omit<
    BlogPostMeta,
    "title" | "excerpt" | "readTime" | "coverImageAlt"
  >
> = {
  "why-every-kinshasa-school-should-run-on-shuleos": {
    slug: "why-every-kinshasa-school-should-run-on-shuleos",
    locale: "en",
    category: "conversion",
    focusKeyword: "school management system Kinshasa",
    secondaryKeywords: ["ShuleOS", "DRC private schools", "school software Congo"],
    relatedSlugs: [
      "school-management-system-drc",
      "every-way-shuleos-stops-the-leaks",
      "systeme-de-gestion-scolaire-rdc",
    ],
    relatedModules: ["finance", "academic", "parent-student-portals"],
    date: "2026-08-12",
    coverImage: LEGACY_COVER_IMAGES["why-every-kinshasa-school-should-run-on-shuleos"],
  },
  "every-way-shuleos-stops-the-leaks": {
    slug: "every-way-shuleos-stops-the-leaks",
    locale: "en",
    category: "conversion",
    focusKeyword: "school management platform",
    secondaryKeywords: ["fee leaks", "DRC schools", "school ERP"],
    relatedSlugs: [
      "what-is-a-school-management-system",
      "why-every-kinshasa-school-should-run-on-shuleos",
      "school-fee-management-software",
    ],
    relatedModules: ["finance", "academic", "parent-student-portals"],
    date: "2026-08-05",
    coverImage: LEGACY_COVER_IMAGES["every-way-shuleos-stops-the-leaks"],
  },
};

type BlogTranslator = {
  (key: string): string;
  raw: (key: string) => unknown;
  has: (key: string) => boolean;
};

type RawSection = {
  title?: unknown;
  body?: unknown;
  costLabel?: unknown;
  cost?: unknown;
  fixLabel?: unknown;
  fix?: unknown;
  whoLabel?: unknown;
  who?: unknown;
  imageAlt?: unknown;
  imageCaption?: unknown;
};

function isLegacyBlogPostSlug(slug: string): slug is LegacyBlogPostSlug {
  return (LEGACY_I18N_BLOG_SLUGS as readonly string[]).includes(slug);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function rawIfPresent(t: BlogTranslator, key: string): unknown {
  return t.has(key) ? t.raw(key) : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    return undefined;
  }
  return value;
}

function asFacts(value: unknown): BlogFact[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const facts = value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const factValue = asString(record.value);
    const label = asString(record.label);
    if (!factValue || !label) return [];
    return [
      {
        value: factValue,
        label,
        source: asString(record.source),
      },
    ];
  });

  return facts.length > 0 ? facts : undefined;
}

function asLabeledItems(value: unknown): BlogLabeledItem[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const items = value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const title = asString(record.title);
    const detail = asString(record.detail);
    if (!title || !detail) return [];
    return [{ title, detail }];
  });

  return items.length > 0 ? items : undefined;
}

function parseLegacySections(
  value: unknown,
  images: (string | undefined)[]
): BlogSection[] | null {
  if (!Array.isArray(value)) return null;

  const sections = value.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const section = item as RawSection;
    const title = asString(section.title);
    if (!title) return [];

    return [
      {
        title,
        body: asStringArray(section.body),
        costLabel: asString(section.costLabel),
        cost: asString(section.cost),
        fixLabel: asString(section.fixLabel),
        fix: asString(section.fix),
        whoLabel: asString(section.whoLabel),
        who: asString(section.who),
        image: images[index],
        imageAlt: asString(section.imageAlt),
        imageCaption: asString(section.imageCaption),
      },
    ];
  });

  return sections.length > 0 ? sections : null;
}

function getLegacyBlogPost(slug: LegacyBlogPostSlug, t: BlogTranslator): BlogPost | null {
  const base = `posts.${slug}`;
  const intro = asStringArray(rawIfPresent(t, `${base}.intro`));
  const sections = parseLegacySections(
    rawIfPresent(t, `${base}.sections`),
    LEGACY_SECTION_IMAGES[slug]
  );
  const closing = asStringArray(rawIfPresent(t, `${base}.closing`));
  const meta = LEGACY_META[slug];

  if (!intro || !sections || !closing) {
    return null;
  }

  return {
    ...meta,
    title: t(`${base}.title`),
    excerpt: t(`${base}.excerpt`),
    readTime: t(`${base}.readTime`),
    metaDescription: t(`${base}.metaDescription`),
    coverImageAlt: asString(rawIfPresent(t, `${base}.coverImageAlt`)),
    intro,
    factsTitle: asString(rawIfPresent(t, `${base}.factsTitle`)),
    facts: asFacts(rawIfPresent(t, `${base}.facts`)),
    flowTitle: asString(rawIfPresent(t, `${base}.flowTitle`)),
    flowBeforeLabel: asString(rawIfPresent(t, `${base}.flowBeforeLabel`)),
    flowAfterLabel: asString(rawIfPresent(t, `${base}.flowAfterLabel`)),
    flowBefore: asStringArray(rawIfPresent(t, `${base}.flowBefore`)),
    flowAfter: asStringArray(rawIfPresent(t, `${base}.flowAfter`)),
    termCostTitle: asString(rawIfPresent(t, `${base}.termCostTitle`)),
    termCostIntro: asString(rawIfPresent(t, `${base}.termCostIntro`)),
    termCostItems: asStringArray(rawIfPresent(t, `${base}.termCostItems`)),
    modulesTitle: asString(rawIfPresent(t, `${base}.modulesTitle`)),
    modulesIntro: asString(rawIfPresent(t, `${base}.modulesIntro`)),
    modules: asLabeledItems(rawIfPresent(t, `${base}.modules`)),
    sections,
    midCtaTitle: t(`${base}.midCtaTitle`),
    midCtaBody: t(`${base}.midCtaBody`),
    midCtaPrimary: t(`${base}.midCtaPrimary`),
    midCtaSecondary: t(`${base}.midCtaSecondary`),
    closing,
    sourcesLabel: asString(rawIfPresent(t, `${base}.sourcesLabel`)),
    sources: asStringArray(rawIfPresent(t, `${base}.sources`)),
    ctaPrimary: t(`${base}.ctaPrimary`),
    ctaSecondary: t(`${base}.ctaSecondary`),
    ctaTertiary: t(`${base}.ctaTertiary`),
    relatedLabel: t(`${base}.relatedLabel`),
    relatedFinance: t(`${base}.relatedFinance`),
    relatedAcademic: t(`${base}.relatedAcademic`),
    relatedPortals: t(`${base}.relatedPortals`),
  };
}

export function getAllBlogPostSlugs(): string[] {
  return [...getStaticBlogPostSlugs(), ...LEGACY_I18N_BLOG_SLUGS];
}

export function getBlogPostSlugs(): string[] {
  return getAllBlogPostSlugs();
}

export function getBlogPost(slug: string, t: BlogTranslator): BlogPost | null {
  const staticPost = getStaticBlogPost(slug);
  if (staticPost) {
    return staticPost;
  }

  if (isLegacyBlogPostSlug(slug)) {
    return getLegacyBlogPost(slug, t);
  }

  return null;
}

export function getBlogPosts(t: BlogTranslator, locale?: string): BlogPost[] {
  const staticPosts = STATIC_BLOG_POSTS.filter(
    (post) => !locale || post.locale === locale
  );

  const legacyPosts = LEGACY_I18N_BLOG_SLUGS.map((slug) =>
    getLegacyBlogPost(slug, t)
  ).filter((post): post is BlogPost => post !== null);

  return [...staticPosts, ...legacyPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getBlogPostsBySlugs(
  slugs: string[],
  t: BlogTranslator
): BlogPost[] {
  return slugs
    .map((slug) => getBlogPost(slug, t))
    .filter((post): post is BlogPost => post !== null);
}

export function getBlogPostsByCategory(
  category: BlogCategory,
  t: BlogTranslator,
  locale?: string
): BlogPost[] {
  return getBlogPosts(t, locale).filter((post) => post.category === category);
}

export function formatBlogDate(dateIso: string, locale: string): string {
  const date = new Date(`${dateIso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateIso;

  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
