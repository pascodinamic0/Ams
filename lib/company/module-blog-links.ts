/** Contextual blog links from module pages into the SEO cluster. */
export const MODULE_BLOG_LINKS: Record<string, { href: string; labelEn: string; labelFr: string }> = {
  academic: {
    href: "/blog/school-report-card-software",
    labelEn: "School report card software guide",
    labelFr: "Guide bulletins scolaires",
  },
  finance: {
    href: "/blog/school-fee-management-software",
    labelEn: "School fee management software guide",
    labelFr: "Guide gestion des frais scolaires",
  },
  "parent-student-portals": {
    href: "/blog/parent-portal-for-schools",
    labelEn: "Parent portal for schools guide",
    labelFr: "Guide portail parents",
  },
  messaging: {
    href: "/blog/parent-portal-for-schools",
    labelEn: "Parent communication guide",
    labelFr: "Guide communication parents",
  },
  analytics: {
    href: "/blog/what-is-a-school-management-system",
    labelEn: "What is a school management system?",
    labelFr: "Qu'est-ce qu'un système de gestion scolaire ?",
  },
  operations: {
    href: "/blog/what-is-a-school-management-system",
    labelEn: "School management system overview",
    labelFr: "Vue d'ensemble gestion scolaire",
  },
  "school-websites": {
    href: "/blog/school-management-system-drc",
    labelEn: "School management system DRC",
    labelFr: "Système de gestion scolaire RDC",
  },
};

export function getModuleBlogLink(slug: string, locale: string) {
  const link = MODULE_BLOG_LINKS[slug];
  if (!link) return null;
  return {
    href: link.href,
    label: locale === "fr" ? link.labelFr : link.labelEn,
  };
}
