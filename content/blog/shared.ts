/** Shared blog CTA strings (English). */
export const blogCtaEn = {
  midCtaTitle: "Fee season and report cards don't wait",
  midCtaBody:
    "Every week off-platform is another queue, another dispute, another evening lost to double entry. Request access before the next term locks in the same leaks.",
  midCtaPrimary: "Stop the leaks",
  midCtaSecondary: "See all features",
  ctaPrimary: "Stop the leaks",
  ctaSecondary: "See all features",
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
    "Chaque semaine hors plateforme, c'est une file de plus, un litige de plus, une soirée perdue à ressaisir. Demandez l'accès avant que le prochain trimestre ne verrouille les mêmes fuites.",
  midCtaPrimary: "Stopper les fuites",
  midCtaSecondary: "Voir les fonctionnalités",
  ctaPrimary: "Stopper les fuites",
  ctaSecondary: "Voir les fonctionnalités",
  ctaTertiary: "Corriger avant le prochain trimestre",
  relatedLabel: "Modules associés",
  relatedFinance: "Finance",
  relatedAcademic: "Académique",
  relatedPortals: "Portails parents & élèves",
} as const;

export function coverImage(slug: string): string {
  return `/images/blog/${slug}.jpg`;
}
