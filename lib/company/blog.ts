export const BLOG_POST_SLUGS = [
  "why-every-kinshasa-school-should-run-on-shuleos",
  "every-way-shuleos-stops-the-leaks",
] as const;

export type BlogPostSlug = (typeof BLOG_POST_SLUGS)[number];

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
  costLabel: string;
  cost: string;
  fixLabel: string;
  fix: string;
  whoLabel: string;
  who: string;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
};

/** Static cover art per post (under /public). */
const BLOG_COVER_IMAGES: Record<BlogPostSlug, string> = {
  "why-every-kinshasa-school-should-run-on-shuleos":
    "/images/blog/why-every-kinshasa-school-should-run-on-shuleos.jpg",
  "every-way-shuleos-stops-the-leaks":
    "/images/blog/every-way-shuleos-stops-the-leaks.jpg",
};

const BLOG_SECTION_IMAGES: Record<BlogPostSlug, (string | undefined)[]> = {
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

export type BlogPost = {
  slug: BlogPostSlug;
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

type BlogTranslator = {
  (key: string): string;
  raw: (key: string) => unknown;
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

function isBlogPostSlug(slug: string): slug is BlogPostSlug {
  return (BLOG_POST_SLUGS as readonly string[]).includes(slug);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
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

function parseSections(
  value: unknown,
  images: (string | undefined)[]
): BlogSection[] | null {
  if (!Array.isArray(value)) return null;

  const sections = value.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const section = item as RawSection;
    const title = asString(section.title);
    const costLabel = asString(section.costLabel);
    const cost = asString(section.cost);
    const fixLabel = asString(section.fixLabel);
    const fix = asString(section.fix);
    const whoLabel = asString(section.whoLabel);
    const who = asString(section.who);
    if (!title || !costLabel || !cost || !fixLabel || !fix || !whoLabel || !who) {
      return [];
    }

    return [
      {
        title,
        body: asStringArray(section.body),
        costLabel,
        cost,
        fixLabel,
        fix,
        whoLabel,
        who,
        image: images[index],
        imageAlt: asString(section.imageAlt),
        imageCaption: asString(section.imageCaption),
      },
    ];
  });

  return sections.length > 0 ? sections : null;
}

export function getBlogPostSlugs(): BlogPostSlug[] {
  return [...BLOG_POST_SLUGS];
}

export function getBlogPost(
  slug: string,
  t: BlogTranslator
): BlogPost | null {
  if (!isBlogPostSlug(slug)) return null;

  const base = `posts.${slug}`;
  const intro = asStringArray(t.raw(`${base}.intro`));
  const sections = parseSections(
    t.raw(`${base}.sections`),
    BLOG_SECTION_IMAGES[slug]
  );
  const closing = asStringArray(t.raw(`${base}.closing`));

  if (!intro || !sections || !closing) {
    return null;
  }

  return {
    slug,
    title: t(`${base}.title`),
    excerpt: t(`${base}.excerpt`),
    date: t(`${base}.date`),
    readTime: t(`${base}.readTime`),
    metaDescription: t(`${base}.metaDescription`),
    coverImage: BLOG_COVER_IMAGES[slug],
    coverImageAlt: asString(t.raw(`${base}.coverImageAlt`)),
    intro,
    factsTitle: asString(t.raw(`${base}.factsTitle`)),
    facts: asFacts(t.raw(`${base}.facts`)),
    flowTitle: asString(t.raw(`${base}.flowTitle`)),
    flowBeforeLabel: asString(t.raw(`${base}.flowBeforeLabel`)),
    flowAfterLabel: asString(t.raw(`${base}.flowAfterLabel`)),
    flowBefore: asStringArray(t.raw(`${base}.flowBefore`)),
    flowAfter: asStringArray(t.raw(`${base}.flowAfter`)),
    termCostTitle: asString(t.raw(`${base}.termCostTitle`)),
    termCostIntro: asString(t.raw(`${base}.termCostIntro`)),
    termCostItems: asStringArray(t.raw(`${base}.termCostItems`)),
    modulesTitle: asString(t.raw(`${base}.modulesTitle`)),
    modulesIntro: asString(t.raw(`${base}.modulesIntro`)),
    modules: asLabeledItems(t.raw(`${base}.modules`)),
    sections,
    midCtaTitle: t(`${base}.midCtaTitle`),
    midCtaBody: t(`${base}.midCtaBody`),
    midCtaPrimary: t(`${base}.midCtaPrimary`),
    midCtaSecondary: t(`${base}.midCtaSecondary`),
    closing,
    sourcesLabel: asString(t.raw(`${base}.sourcesLabel`)),
    sources: asStringArray(t.raw(`${base}.sources`)),
    ctaPrimary: t(`${base}.ctaPrimary`),
    ctaSecondary: t(`${base}.ctaSecondary`),
    ctaTertiary: t(`${base}.ctaTertiary`),
    relatedLabel: t(`${base}.relatedLabel`),
    relatedFinance: t(`${base}.relatedFinance`),
    relatedAcademic: t(`${base}.relatedAcademic`),
    relatedPortals: t(`${base}.relatedPortals`),
  };
}

export function getBlogPosts(t: BlogTranslator): BlogPost[] {
  return BLOG_POST_SLUGS.map((slug) => getBlogPost(slug, t)).filter(
    (post): post is BlogPost => post !== null
  );
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
