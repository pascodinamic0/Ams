import type { BlogPostContent } from "@/lib/company/blog-types";
import { blogCtaFr, coverImage } from "@/content/blog/shared";

export const systemeDeGestionScolaireRdc: BlogPostContent = {
  slug: "systeme-de-gestion-scolaire-rdc",
  locale: "fr",
  category: "drc",
  focusKeyword: "système de gestion scolaire RDC",
  secondaryKeywords: [
    "logiciel scolaire Congo",
    "gestion scolaire Kinshasa",
    "school management system DRC",
  ],
  relatedSlugs: [
    "logiciel-de-gestion-scolaire",
    "why-every-kinshasa-school-should-run-on-shuleos",
    "school-management-system-drc",
  ],
  relatedModules: ["finance", "academic", "messaging"],
  title: "Système de gestion scolaire RDC : Kinshasa paie déjà  en fuites",
  excerpt:
    "Frais CDF/USD, bulletins Programme National, parents WhatsApp, présences hors ligne : un système de gestion scolaire en RDC doit coller au terrain.",
  date: "2026-08-13",
  readTime: "10 min de lecture",
  metaDescription:
    "Système de gestion scolaire RDC : écoles privées Kinshasa, mobile money, bulletins nationaux, support local ShuleOS depuis Batetela.",
  coverImage: coverImage("systeme-de-gestion-scolaire-rdc"),
  coverImageAlt:
    "Cour d'école privée à Kinshasa avec élèves en uniforme et téléphones mobiles.",
  intro: [
    "En RDC  surtout à Kinshasa  les écoles privées vivent des frais des parents. Le système de gestion scolaire n'est pas un luxe administratif : c'est la caisse et le dossier pédagogique en même temps.",
    "Importer un logiciel étranger traduit en français ignore encore le Programme National, le mobile money, et les salles où le réseau tombe en plein appel.",
    "ShuleOS est développé à Kinshasa (Batetela) pour ce contexte  pas pour le réadapter depuis un autre pays.",
  ],
  sections: [
    {
      title: "Économie des écoles privées congolaises",
      body: [
        "Sans registre unique des frais, l'école finance ses propres fuites : soldes contestés, encaissements tardifs.",
        "Le directeur a besoin du taux de recouvrement en cours de trimestre  pas en juillet.",
        "Chaque « on va vérifier » à la porte coûte du temps staff et de la confiance parent.",
      ],
    },
    {
      title: "Bulletins et pédagogie nationale",
      body: [
        "Les bulletins suivent le Programme National  pas un GPA américain.",
        "Reconstruire les notes depuis des cahiers la veille des impressions est la facture d'un trimestre sans système.",
        "Le carnet de notes en ligne doit produire le bulletin officiel.",
      ],
    },
    {
      title: "Mobile money et WhatsApp",
      body: [
        "Les parents paient comme Kinshasa paie : cash, CDF, USD, téléphone.",
        "Les rappels de frais doivent partir sur WhatsApp avec une trace  pas depuis le numéro perso du directeur sans historique.",
        "Le portail parent montre le solde avant le déplacement vers l'école.",
      ],
    },
    {
      title: "Présences hors ligne",
      body: [
        "La connexion coupe encore en classe. L'appel ne peut pas attendre le routeur.",
        "ShuleOS enregistre les présences hors ligne et synchronise ensuite  le jour compte quand même.",
      ],
    },
  ],
  faq: [
    {
      question: "ShuleOS convient-il aux écoles hors Kinshasa ?",
      answer:
        "Oui. La plateforme sert des établissements dans toute la RDC avec les mêmes fonctions hors ligne et workflows locaux.",
    },
    {
      question: "Y a-t-il des frais d'installation ?",
      answer:
        "Non. L'objectif est une mise en route en une après-midi : site public, rôles, portails  sans matériel spécial.",
    },
  ],
  ...blogCtaFr,
  closing: [
    "Encore un trimestre sur papier, c'est un système de gestion scolaire RDC que vous payez en heures perdues.",
    "Centralisez frais, bulletins et parents avant la prochaine rentrée  depuis une plateforme construite à Kinshasa.",
  ],
};
