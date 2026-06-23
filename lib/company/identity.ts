/** Public company identity - sourced from digni-digital-llc.com (Nairobi office). */
export const companyIdentity = {
  productName: "ShuleOS",
  productFullName: "ShuleOS - School Management Platform",
  legalName: "Digni Digital LLC",
  tagline: "The operating system for schools",
  origin: "Serving schools across Africa",
  website: "https://www.digni-digital-llc.com",

  office: {
    city: "Nairobi",
    country: "Kenya",
    label: "Nairobi, Kenya",
    addressLines: [
      "Westlands Business Park",
      "Waiyaki Way",
      "Nairobi, 00100",
      "Kenya",
    ],
    addressFormatted:
      "Westlands Business Park, Waiyaki Way, Nairobi, 00100, Kenya",
    timezone: "EAT (UTC+3)",
    supportHours: "Mon-Fri, 8:00 AM - 6:00 PM EAT",
  },

  contact: {
    email: "growth@digni-digital-llc.com",
    supportEmail: "support@digni-digital-llc.com",
    legalEmail: "growth@digni-digital-llc.com",
    privacyEmail: "support@digni-digital-llc.com",
    phone: "+254702593518",
    phoneDisplay: "+254 702 593 518",
    whatsappUrl: "https://wa.me/254702593518",
  },

  social: {
    linkedin: "https://www.linkedin.com/company/digni-digital-kenya",
  },
} as const;
