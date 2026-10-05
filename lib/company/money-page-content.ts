export type MoneyPageSection = {
  title: string;
  body: string[];
  moduleHref?: string;
  moduleLabel?: string;
  blogHref?: string;
  blogLabel?: string;
};

export type MoneyPageContent = {
  path: string;
  locale: "en" | "fr";
  title: string;
  metaDescription: string;
  eyebrow: string;
  headline: string;
  subtitle: string;
  sections: MoneyPageSection[];
  ctaPrimary: string;
  ctaSecondary: string;
  ctaTertiary: string;
  relatedBlogLabel: string;
  relatedBlogLinks: { href: string; label: string }[];
};

export const schoolManagementSystemEn: MoneyPageContent = {
  path: "/school-management-system",
  locale: "en",
  title: "School Management System",
  metaDescription:
    "ShuleOS school management system for DRC private schools: fees, grades, attendance, parent messages, a school website, and attendance that still marks when the signal drops.",
  eyebrow: "School management system",
  headline: "Your school already runs a system. It's costing you every week.",
  subtitle:
    "Notebooks, WhatsApp, and spreadsheets are a school management system — just one that leaks fees, grades, and trust. ShuleOS replaces it with one record staff still operate.",
  sections: [
    {
      title: "Academic management",
      body: [
        "Admissions, classes, timetable, attendance, gradebook, exams, and printable term report cards from the gradebook — not rebuilt from chats at term end. These are school report cards, not a claimed official ministry bulletin grid.",
      ],
      moduleHref: "/modules/academic",
      moduleLabel: "Academic module",
      blogHref: "/blog/school-report-card-software",
      blogLabel: "Report card software guide",
    },
    {
      title: "Fee collection & finance",
      body: [
        "Fee structures, invoices, recorded payments (including mobile money received at the school), WhatsApp fee reminders when connected, expenses, payroll, and collection reports the bursar can defend before the gate queue forms. Each school uses one currency in the app.",
      ],
      moduleHref: "/modules/finance",
      moduleLabel: "Finance module",
      blogHref: "/blog/school-fee-management-software",
      blogLabel: "Fee management software guide",
    },
    {
      title: "Parent & student portals",
      body: [
        "Balances, grades, attendance, timetable, assignments, and messages on the phone — so parents stop learning by accident and the office stops being a helpdesk. Parents see the amount due and how to pay; in-app card checkout is not enabled yet.",
      ],
      moduleHref: "/modules/parent-student-portals",
      moduleLabel: "Parent & student portals",
      blogHref: "/blog/parent-portal-for-schools",
      blogLabel: "Parent portal guide",
    },
    {
      title: "Offline attendance",
      body: [
        "Installable PWA: teachers can mark attendance when the signal drops, then sync. Most of the app still needs a connection. Payments are not recorded offline.",
      ],
      moduleHref: "/modules/academic",
      moduleLabel: "Attendance in Academic",
      blogHref: "/blog/school-attendance-software",
      blogLabel: "Attendance software guide",
    },
    {
      title: "Messaging & outreach",
      body: [
        "In-app messages and WhatsApp outreach when connected — not unlogged chats that become disputes with no proof. SMS campaigns are not available.",
      ],
      moduleHref: "/modules/messaging",
      moduleLabel: "Messaging module",
    },
    {
      title: "Built for DRC & Africa",
      body: [
        "French and English, Kinshasa WhatsApp hours, printable term report cards, and workflows aimed at how private schools actually run. Contact Kinshasa for schools outside the city.",
      ],
      blogHref: "/blog/school-management-system-drc",
      blogLabel: "School management system DRC",
    },
  ],
  ctaPrimary: "Stop the leaks",
  ctaSecondary: "See all features",
  ctaTertiary: "WhatsApp us",
  relatedBlogLabel: "School management guides",
  relatedBlogLinks: [
    { href: "/blog/what-is-a-school-management-system", label: "What is a school management system?" },
    { href: "/blog/student-information-system", label: "Student information system (SIS)" },
    { href: "/blog/school-management-system-drc", label: "School management system DRC" },
  ],
};

export const logicielGestionScolaireFr: MoneyPageContent = {
  path: "/logiciel-de-gestion-scolaire",
  locale: "fr",
  title: "Logiciel de gestion scolaire",
  metaDescription:
    "Logiciel de gestion scolaire ShuleOS pour les ecoles privees en RDC : frais, notes, presences, messages parents, site scolaire, et appel qui continue quand le reseau coupe.",
  eyebrow: "Logiciel de gestion scolaire",
  headline: "Votre ecole a deja un systeme. Il lui coute chaque semaine.",
  subtitle:
    "Cahiers, WhatsApp et Excel sont un systeme de gestion scolaire - mais qui fait fuir les frais, les notes et la confiance. ShuleOS les remplace par un dossier unique.",
  sections: [
    {
      title: "Gestion academique",
      body: [
        "Admissions, classes, emploi du temps, presences, carnet de notes, examens et bulletins imprimables depuis le carnet — pas reconstruits depuis les chats. Ce sont des cartes de notes, pas une grille ministerielle officielle.",
      ],
      moduleHref: "/modules/academic",
      moduleLabel: "Module academique",
      blogHref: "/blog/logiciel-de-gestion-scolaire",
      blogLabel: "Guide logiciel de gestion scolaire",
    },
    {
      title: "Frais et finance",
      body: [
        "Grilles de frais, factures, paiements enregistres (y compris un paiement mobile money recu a l'ecole), rappels WhatsApp lorsqu'ils sont connectes, depenses, paie et rapports de recouvrement. Une devise par ecole dans l'application.",
      ],
      moduleHref: "/modules/finance",
      moduleLabel: "Module finance",
    },
    {
      title: "Portails parents et eleves",
      body: [
        "Soldes, notes, absences, emploi du temps et messages sur le telephone — sans file au secretariat. Les parents voient le montant du et comment payer ; le paiement par carte dans l'app n'est pas encore active.",
      ],
      moduleHref: "/modules/parent-student-portals",
      moduleLabel: "Portails parents & eleves",
    },
    {
      title: "Presences hors ligne",
      body: [
        "PWA installable : l'appel peut continuer quand le reseau coupe, puis se synchronise. Le reste de l'app a besoin d'une connexion. Les paiements ne s'enregistrent pas hors ligne.",
      ],
      blogHref: "/blog/systeme-de-gestion-scolaire-rdc",
      blogLabel: "Systeme de gestion scolaire RDC",
    },
  ],
  ctaPrimary: "Stopper les fuites",
  ctaSecondary: "Voir les fonctionnalites",
  ctaTertiary: "Nous contacter",
  relatedBlogLabel: "Guides gestion scolaire",
  relatedBlogLinks: [
    { href: "/blog/logiciel-de-gestion-scolaire", label: "Qu'est-ce qu'un logiciel de gestion scolaire ?" },
    { href: "/blog/systeme-de-gestion-scolaire-rdc", label: "Systeme de gestion scolaire RDC" },
    { href: "/blog/why-every-kinshasa-school-should-run-on-shuleos", label: "Ecoles de Kinshasa" },
  ],
};
