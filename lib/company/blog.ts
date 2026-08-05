export const BLOG_POST_SLUGS = [
  "every-way-shuleos-stops-the-leaks",
] as const;

export type BlogPostSlug = (typeof BLOG_POST_SLUGS)[number];

export type BlogSection = {
  title: string;
  costLabel: string;
  cost: string;
  fixLabel: string;
  fix: string;
  whoLabel: string;
  who: string;
};

export type BlogPost = {
  slug: BlogPostSlug;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  metaDescription: string;
  intro: string[];
  sections: BlogSection[];
  midCtaTitle: string;
  midCtaBody: string;
  midCtaPrimary: string;
  midCtaSecondary: string;
  closing: string[];
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

function isBlogPostSlug(slug: string): slug is BlogPostSlug {
  return (BLOG_POST_SLUGS as readonly string[]).includes(slug);
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
  const intro = t.raw(`${base}.intro`);
  const sections = t.raw(`${base}.sections`);
  const closing = t.raw(`${base}.closing`);

  if (!Array.isArray(intro) || !Array.isArray(sections) || !Array.isArray(closing)) {
    return null;
  }

  return {
    slug,
    title: t(`${base}.title`),
    excerpt: t(`${base}.excerpt`),
    date: t(`${base}.date`),
    readTime: t(`${base}.readTime`),
    metaDescription: t(`${base}.metaDescription`),
    intro: intro as string[],
    sections: sections as BlogSection[],
    midCtaTitle: t(`${base}.midCtaTitle`),
    midCtaBody: t(`${base}.midCtaBody`),
    midCtaPrimary: t(`${base}.midCtaPrimary`),
    midCtaSecondary: t(`${base}.midCtaSecondary`),
    closing: closing as string[],
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
