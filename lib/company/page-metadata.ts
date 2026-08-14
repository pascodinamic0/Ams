import type { Metadata } from "next";
import { companyIdentity } from "@/lib/company/identity";
import { absoluteUrl } from "@/lib/company/site-url";

export function buildPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  images?: string[];
}): Metadata {
  const url = absoluteUrl(options.path);
  const images = options.images ?? ["/images/blog/why-every-kinshasa-school-should-run-on-shuleos.jpg"];

  return {
    title: options.title,
    description: options.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      type: options.type ?? "website",
      siteName: companyIdentity.productName,
      publishedTime: options.publishedTime,
      images: images.map((image) => ({
        url: image.startsWith("http") ? image : absoluteUrl(image),
        width: 1536,
        height: 1024,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: images.map((image) =>
        image.startsWith("http") ? image : absoluteUrl(image)
      ),
    },
  };
}
