import type { BlogPostContent } from "@/lib/company/blog-types";
import { logicielDeGestionScolaire } from "@/content/blog/posts/logiciel-de-gestion-scolaire";
import { parentPortalForSchools } from "@/content/blog/posts/parent-portal-for-schools";
import { schoolAttendanceSoftware } from "@/content/blog/posts/school-attendance-software";
import { schoolFeeManagementSoftware } from "@/content/blog/posts/school-fee-management-software";
import { schoolManagementSystemDrc } from "@/content/blog/posts/school-management-system-drc";
import { schoolReportCardSoftware } from "@/content/blog/posts/school-report-card-software";
import { studentInformationSystem } from "@/content/blog/posts/student-information-system";
import { systemeDeGestionScolaireRdc } from "@/content/blog/posts/systeme-de-gestion-scolaire-rdc";
import { whatIsSchoolManagementSystem } from "@/content/blog/posts/what-is-a-school-management-system";

/** Locale-fixed posts loaded from content files (SEO-indexable). */
export const STATIC_BLOG_POSTS: BlogPostContent[] = [
  whatIsSchoolManagementSystem,
  schoolAttendanceSoftware,
  schoolFeeManagementSoftware,
  parentPortalForSchools,
  schoolReportCardSoftware,
  studentInformationSystem,
  schoolManagementSystemDrc,
  logicielDeGestionScolaire,
  systemeDeGestionScolaireRdc,
];

export const STATIC_BLOG_POSTS_BY_SLUG = new Map(
  STATIC_BLOG_POSTS.map((post) => [post.slug, post])
);

export function getStaticBlogPost(slug: string): BlogPostContent | undefined {
  return STATIC_BLOG_POSTS_BY_SLUG.get(slug);
}

export function getStaticBlogPostSlugs(): string[] {
  return STATIC_BLOG_POSTS.map((post) => post.slug);
}
