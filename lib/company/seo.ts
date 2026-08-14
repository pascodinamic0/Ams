import { companyIdentity } from "@/lib/company/identity";
import { absoluteUrl } from "@/lib/company/site-url";
import type { BlogFaqItem, BlogPost } from "@/lib/company/blog-types";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: companyIdentity.legalName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/images/shuleos-logo.svg"),
    sameAs: [companyIdentity.social.linkedin],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: companyIdentity.contact.phone,
      email: companyIdentity.contact.email,
      contactType: "customer support",
      areaServed: "CD",
      availableLanguage: ["English", "French"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: companyIdentity.office.addressLines.slice(0, 2).join(", "),
      addressLocality: companyIdentity.office.city,
      addressCountry: "CD",
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: companyIdentity.productName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, PWA",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "School management system for DRC and African schools",
    },
    description: companyIdentity.tagline,
    url: absoluteUrl("/school-management-system"),
    provider: {
      "@type": "Organization",
      name: companyIdentity.legalName,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function blogPostingJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    dateModified: post.date,
    image: absoluteUrl(post.coverImage),
    author: {
      "@type": "Organization",
      name: companyIdentity.productName,
    },
    publisher: {
      "@type": "Organization",
      name: companyIdentity.legalName,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/shuleos-logo.svg"),
      },
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    inLanguage: post.locale,
    keywords: [post.focusKeyword, ...post.secondaryKeywords].join(", "),
  };
}

export function faqPageJsonLd(faq: BlogFaqItem[]) {
  if (faq.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function webPageJsonLd(options: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.path),
    isPartOf: {
      "@type": "WebSite",
      name: companyIdentity.productName,
      url: absoluteUrl("/"),
    },
  };
}
