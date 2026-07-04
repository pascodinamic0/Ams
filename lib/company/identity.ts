/** Public company identity - sourced from digni-digital-llc.com (Kinshasa office). */
export const companyIdentity = {
  productName: "ShuleOS",
  productFullName: "ShuleOS - School Management Platform",
  legalName: "Digni Digital LLC",
  tagline: "The operating system for schools",
  origin: "Serving schools across the DRC",
  website: "https://www.digni-digital-llc.com",

  office: {
    city: "Kinshasa",
    country: "Democratic Republic of the Congo",
    label: "Kinshasa, DRC",
    addressLines: [
      "Immeuble Crown Towers",
      "Sur Batetela, Floor 15, Office 1502",
      "Kinshasa, Democratic Republic of the Congo",
    ],
    addressFormatted:
      "Immeuble Crown Towers, Sur Batetela, Floor 15, Office 1502, Kinshasa, Democratic Republic of the Congo",
    timezone: "WAT (UTC+1)",
    supportHours: "Mon-Fri, 8:00 AM - 6:00 PM WAT",
  },

  contact: {
    email: "growth@digni-digital-llc.com",
    supportEmail: "support@digni-digital-llc.com",
    legalEmail: "growth@digni-digital-llc.com",
    privacyEmail: "support@digni-digital-llc.com",
    phone: "+243822378097",
    phoneDisplay: "+243 822 378 097",
    whatsappUrl: "https://wa.me/243822378097",
  },

  social: {
    linkedin: "https://www.linkedin.com/company/digni-digital-kenya",
  },

  brand: {
    primary: "#0d9488",
    primaryHover: "#0f766e",
    primaryLight: "#f0fdfa",
    accent: "#f59e0b",
    accentHover: "#d97706",
    background: "#fafaf9",
    foreground: "#1c1917",
    darkBackground: "#0c1222",
    darkPrimary: "#14b8a6",
  },
} as const;
