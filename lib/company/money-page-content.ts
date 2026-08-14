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
    "ShuleOS school management system for DRC and African schools: academics, fee collection, mobile money, parent portals, Programme National report cards, and offline attendance.",
  eyebrow: "School management system",
  headline: "Your school already runs a system. It's costing you every week.",
  subtitle:
    "Notebooks, WhatsApp, and spreadsheets are a school management system - just one that leaks fees, grades, and trust. ShuleOS replaces it with one record: every role, every duty, nothing loseable.",
  sections: [
    {
      title: "Academic management",
      body: [
        "Admissions, classes, timetable, attendance, gradebook, exams, and Programme National report cards - in the teacher workflow, not rebuilt from chats at term end.",
      ],
      moduleHref: "/modules/academic",
      moduleLabel: "Academic module",
      blogHref: "/blog/school-report-card-software",
      blogLabel: "Report card software guide",
    },
    {
      title: "Fee collection & finance",
      body: [
        "Fee structures, invoices in CDF and USD, mobile money, WhatsApp fee reminders, expenses, payroll, and collection reports the bursar can defend before the gate queue forms.",
      ],
      moduleHref: "/modules/finance",
      moduleLabel: "Finance module",
      blogHref: "/blog/school-fee-management-software",
      blogLabel: "Fee management software guide",
    },
    {
      title: "Parent & student portals",
      body: [
        "Balances, grades, attendance, timetable, assignments, and messages on the phone - so parents stop learning by accident and the office stops being a helpdesk.",
      ],
      moduleHref: "/modules/parent-student-portals",
      moduleLabel: "Parent & student portals",
      blogHref: "/blog/parent-portal-for-schools",
      blogLabel: "Parent portal guide",
    },
    {
      title: "Offline attendance",
      body: [
        "Installable PWA with attendance that survives dead signal - sync when connectivity returns. The roll call cannot wait for the router.",
      ],
      moduleHref: "/modules/academic",
      moduleLabel: "Attendance in Academic",
      blogHref: "/blog/school-attendance-software",
      blogLabel: "Attendance software guide",
    },
    {
      title: "Messaging & outreach",
      body: [
        "Logged WhatsApp and SMS campaigns with delivery trails - not unlogged chats that become disputes with no proof.",
      ],
      moduleHref: "/modules/messaging",
      moduleLabel: "Messaging module",
    },
    {
      title: "Built for DRC & Africa",
      body: [
        "French and English, Kinshasa support hours, national curriculum bulletins, multi-currency fees, and workflows that match how private schools actually run.",
      ],
      blogHref: "/blog/school-management-system-drc",
      blogLabel: "School management system DRC",
    },
  ],
  ctaPrimary: "Stop the leaks",
  ctaSecondary: "See what it's costing you",
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
    "Logiciel de gestion scolaire ShuleOS pour la RDC : academique, frais, mobile money, portails parents, bulletins Programme National et presences hors ligne.",
  eyebrow: "Logiciel de gestion scolaire",
  headline: "Votre ecole a deja un systeme. Il lui coute chaque semaine.",
  subtitle:
    "Cahiers, WhatsApp et Excel sont un systeme de gestion scolaire - mais qui fait fuir les frais, les notes et la confiance. ShuleOS les remplace par un dossier unique.",
  sections: [
    {
      title: "Gestion academique",
      body: [
        "Admissions, classes, emploi du temps, presences, carnet de notes, examens et bulletins Programme National - dans le flux enseignant, pas reconstruits depuis les chats.",
      ],
      moduleHref: "/modules/academic",
      moduleLabel: "Module academique",
      blogHref: "/blog/logiciel-de-gestion-scolaire",
      blogLabel: "Guide logiciel de gestion scolaire",
    },
    {
      title: "Frais et finance",
      body: [
        "Grilles de frais, factures CDF/USD, mobile money, rappels WhatsApp, depenses, paie et rapports de recouvrement.",
      ],
      moduleHref: "/modules/finance",
      moduleLabel: "Module finance",
    },
    {
      title: "Portails parents et eleves",
      body: [
        "Soldes, notes, absences, emploi du temps et messages sur le telephone - sans file a la secretariat.",
      ],
      moduleHref: "/modules/parent-student-portals",
      moduleLabel: "Portails parents & eleves",
    },
    {
      title: "Presences hors ligne",
      body: [
        "PWA installable : l'appel continue quand le reseau coupe, synchronisation au retour du signal.",
      ],
      blogHref: "/blog/systeme-de-gestion-scolaire-rdc",
      blogLabel: "Systeme de gestion scolaire RDC",
    },
  ],
  ctaPrimary: "Stopper les fuites",
  ctaSecondary: "Voir ce que ca coute",
  ctaTertiary: "Nous contacter",
  relatedBlogLabel: "Guides gestion scolaire",
  relatedBlogLinks: [
    { href: "/blog/logiciel-de-gestion-scolaire", label: "Qu'est-ce qu'un logiciel de gestion scolaire ?" },
    { href: "/blog/systeme-de-gestion-scolaire-rdc", label: "Systeme de gestion scolaire RDC" },
    { href: "/blog/why-every-kinshasa-school-should-run-on-shuleos", label: "Ecoles de Kinshasa" },
  ],
};
