import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  },
  serverExternalPackages: ["import-in-the-middle", "@sentry/nextjs"],
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns", "framer-motion"],
    // Never reuse soft-navigated RSC payloads — always refetch page data.
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
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
    // Prefer network for navigations so PWA users see fresh server data.
    cacheOnNavigation: false,
    // Register once from SerwistProvider so update prompts are not double-fired.
    register: false,
    // Soft refresh already happens in AutoRefreshProvider; a full reload retriggers the update loop.
    reloadOnOnline: false,
    disable: false,
  });

  return withSerwist(config);
}

const baseConfig = withNextIntl(withOptionalSerwist(nextConfig));

/** Sentry's webpack instrumentation breaks Turbopack HMR in dev (layout-router factory errors). */
export default process.env.TURBOPACK
  ? baseConfig
  : withSentryConfig(baseConfig, {
      org: process.env.SENTRY_ORG ?? "ams",
      project: process.env.SENTRY_PROJECT ?? "ams",
      silent: !process.env.CI,
    });
