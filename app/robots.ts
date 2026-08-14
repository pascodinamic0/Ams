import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/company/site-url";

const DISALLOW_PATHS = [
  "/admin",
  "/academic",
  "/analytics",
  "/auth",
  "/billing",
  "/finance",
  "/messages",
  "/notifications",
  "/offline",
  "/onboarding",
  "/operations",
  "/outreach",
  "/parent",
  "/pending",
  "/settings",
  "/student",
  "/teacher",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOW_PATHS.map((path) => `${path}/`),
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
