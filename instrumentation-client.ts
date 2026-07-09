import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN;

Sentry.init({
  dsn: dsn ?? undefined,
  enabled: !!dsn,

  sendDefaultPii: true,

  tracesSampleRate:
    process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Replay is heavy; only attach on errors in production.
  integrations:
    process.env.NODE_ENV === "development"
      ? [Sentry.replayIntegration()]
      : [
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],

  replaysSessionSampleRate: process.env.NODE_ENV === "development" ? 0.1 : 0,
  replaysOnErrorSampleRate: 1.0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
