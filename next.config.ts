import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? "ams",
  project: process.env.SENTRY_PROJECT ?? "ams",
  silent: !process.env.CI,
});
