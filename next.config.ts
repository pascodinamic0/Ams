import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? "ams",
  project: process.env.SENTRY_PROJECT ?? "ams",
  silent: !process.env.CI,
});
