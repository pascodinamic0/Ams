import type { BlogPostContent } from "@/lib/company/blog-types";
import { blogCtaFr, coverImage } from "@/content/blog/shared";

export const logicielDeGestionScolaire: BlogPostContent = {
  slug: "logiciel-de-gestion-scolaire",
  locale: "fr",
  category: "francais",
  focusKeyword: "logiciel de gestion scolaire",
  secondaryKeywords: [
    "système de gestion scolaire",
    "logiciel scolaire",
    "ERP scolaire",
  ],
  relatedSlugs: [
    "systeme-de-gestion-scolaire-rdc",
    "why-every-kinshasa-school-should-run-on-shuleos",
    "school-management-system-drc",
  ],
  relatedModules: ["academic", "finance", "parent-student-portals"],
  title: "Logiciel de gestion scolaire : ce qu'une école perd sans système unique",
  excerpt:
    "Un logiciel de gestion scolaire centralise élèves, frais, présences, notes et parents  pas dix cahiers et un groupe WhatsApp. Voici les modules essentiels et comment choisir.",
  date: "2026-08-14",
  readTime: "11 min de lecture",
  metaDescription:
    "Logiciel de gestion scolaire : définition, modules, comparaison tableur vs logiciel, et critères pour les écoles africaines et congolaises.",
  coverImage: coverImage("logiciel-de-gestion-scolaire"),
  coverImageAlt:
    "Directeur d'école consultant un tableau de bord unifié : frais, présences et notes.",
  intro: [
    "Un logiciel de gestion scolaire  ou système de gestion scolaire  est le système d'exploitation de votre établissement : inscriptions, classes, présences, notes, frais, messages aux parents et site public.",
    "La plupart des écoles ont déjà un « système » : registres, Excel, chats WhatsApp et files à la secretariat. Ce bricolage a un prix : frais perdus, bulletins reconstruits à la main, directeurs informés trop tard.",
    "Ce guide explique ce qu'un vrai logiciel de gestion scolaire inclut et comment choisir en RDC et en Afrique francophone.",
  ],
  sections: [
    {
      title: "Rôle d'un logiciel de gestion scolaire",
      body: [
        "Un dossier élève unique : tuteurs, classe, frais, présences et notes au même endroit.",
        "Des vues par rôle : enseignant, caissier, parent, directeur  chacun voit son travail.",
        "Un historique auditable : qui a modifié une note, enregistré un paiement, envoyé un rappel.",
      ],
    },
    {
      title: "Modules indispensables",
      body: [
        "Académique : admissions, classes, emploi du temps, présences, carnet de notes, examens, bulletins Programme National.",
        "Finance : grilles de frais, factures, mobile money, rappels WhatsApp, dépenses et paie.",
        "Portails parents et élèves : soldes, notes, absences, devoirs sur le téléphone.",
        "Messagerie tracée et campagnes SMS/WhatsApp.",
        "Opérations : bibliothèque, transport, événements, personnel.",
        "Analytique : présences, encaissements, performance par site.",
      ],
    },
    {
      title: "Tableur vs logiciel de gestion scolaire",
      body: [
        "Les tableurs cassent silencieusement : mauvais onglet, formule erronée, liste parallèle du prof.",
        "Le logiciel impose un identifiant élève et des droits par rôle.",
        "Le coût caché du papier et d'Excel, ce sont les soirées de ressaisie et les litiges à la porte.",
      ],
    },
    {
      title: "Critères pour la RDC",
      body: [
        "Français et anglais, frais en CDF et USD, bulletins Programme National.",
        "Présences hors ligne quand le réseau coupe.",
        "Support à Kinshasa en horaires WAT  pas une file de tickets à l'étranger.",
      ],
    },
  ],
  faq: [
    {
      question: "Quel est le meilleur logiciel de gestion scolaire ?",
      answer:
        "Celui que votre équipe utilise chaque jour et qui correspond à votre réalité : devise, curriculum, mobile money et WhatsApp. En RDC, ShuleOS est conçu à Kinshasa pour ces workflows.",
    },
    {
      question: "Une petite école privée peut-elle utiliser un logiciel scolaire ?",
      answer:
        "Oui. Les petites structures perdent souvent le plus car une seule personne tient tous les registres. Un système unique supprime ce goulot.",
    },
  ],
  ...blogCtaFr,
  closing: [
    "Un trimestre de plus sur cahiers et WhatsApp, c'est déjà un logiciel de gestion scolaire  mais cher.",
    "ShuleOS est la petite étape suivante : une après-midi pour centraliser frais, notes et parents avant la prochaine rentrée.",
  ],
};
