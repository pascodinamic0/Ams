/** Shared blog CTA strings (English). */
export const blogCtaEn = {
  midCtaTitle: "Fee season and report cards don't wait",
  midCtaBody:
    "Every week off-platform is another queue, another dispute, another evening lost to double entry. One afternoon to go live beats another term of leaks.",
  midCtaPrimary: "Stop the leaks",
  midCtaSecondary: "See what it's costing you",
  ctaPrimary: "Stop the leaks",
  ctaSecondary: "See what it's costing you",
  ctaTertiary: "Fix it before the next term",
  relatedLabel: "Explore related modules",
  relatedFinance: "Finance",
  relatedAcademic: "Academic",
  relatedPortals: "Parent & student portals",
} as const;

/** Shared blog CTA strings (French). */
export const blogCtaFr = {
  midCtaTitle: "La saison des frais et des bulletins n'attend pas",
  midCtaBody:
    "Chaque semaine hors plateforme, c'est une file de plus, un litige de plus, une soirée perdue à ressaisir. Une après-midi pour démarrer vaut mieux qu'un trimestre de fuites.",
  midCtaPrimary: "Stopper les fuites",
  midCtaSecondary: "Voir ce que ça vous coûte",
  ctaPrimary: "Stopper les fuites",
  ctaSecondary: "Voir ce que ça vous coûte",
  ctaTertiary: "Corriger avant le prochain trimestre",
  relatedLabel: "Modules associés",
  relatedFinance: "Finance",
  relatedAcademic: "Académique",
  relatedPortals: "Portails parents & élèves",
} as const;

export function coverImage(slug: string): string {
  return `/images/blog/${slug}.jpg`;
}
