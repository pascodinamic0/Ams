import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

function withOptionalSerwist(config: NextConfig): NextConfig {
  if (process.env.NODE_ENV === "development") {
    return config;
  }

  // Loaded only for production builds so local `next dev` stays lightweight.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withSerwistInit = require("@serwist/next").default as typeof import("@serwist/next").default;
  const withSerwist = withSerwistInit({
    swSrc: "app/sw.ts",
    swDest: "public/sw.js",
    cacheOnNavigation: true,
    reloadOnOnline: true,
    disable: false,
  });

  return withSerwist(config);
}

export default withSentryConfig(withNextIntl(withOptionalSerwist(nextConfig)), {
  org: process.env.SENTRY_ORG ?? "ams",
  project: process.env.SENTRY_PROJECT ?? "ams",
  silent: !process.env.CI,
});
