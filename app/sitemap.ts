import type { MetadataRoute } from "next";
import { getAllBlogPostSlugs } from "@/lib/company/blog";
import { absoluteUrl } from "@/lib/company/site-url";

const MODULE_SLUGS = [
  "academic",
  "finance",
  "operations",
  "analytics",
  "school-websites",
  "messaging",
  "parent-student-portals",
] as const;

const STATIC_PATHS = [
  "/",
  "/features",
  "/blog",
  "/get-access",
  "/contact",
  "/docs",
  "/schools",
  "/privacy",
  "/terms",
  "/cookies",
  "/school-management-system",
  "/logiciel-de-gestion-scolaire",
] as const;

export default function sitemap() {
  const now = new Date();
  const blogSlugs = getAllBlogPostSlugs();

  const entries = [
    ...STATIC_PATHS.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : path.includes("school-management") || path.includes("logiciel") ? 0.95 : 0.8,
    })),
    ...MODULE_SLUGS.map((slug) => ({
      url: absoluteUrl(`/modules/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...blogSlugs.map((slug) => ({
      url: absoluteUrl(`/blog/${slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
  ];

  return entries;
}
