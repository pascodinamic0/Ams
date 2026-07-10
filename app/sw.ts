/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

type PushData = {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
};

self.addEventListener("push", (event) => {
  const fallback: PushData = {
    title: "ShuleOS",
    body: "You have a new notification",
    url: "/notifications",
  };

  let data = fallback;
  try {
    if (event.data) {
      data = { ...fallback, ...(event.data.json() as PushData) };
    }
  } catch {
    try {
      const text = event.data?.text();
      if (text) data = { ...fallback, body: text };
    } catch {
      // keep fallback
    }
  }

  const title = data.title || fallback.title!;
  const options = {
    body: data.body || fallback.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    tag: data.tag || "shuleos-notification",
    renotify: true,
    requireInteraction: Boolean(data.requireInteraction),
    data: { url: data.url || "/notifications" },
    vibrate: data.requireInteraction ? [200, 100, 200, 100, 200] : [120, 60, 120],
  } satisfies NotificationOptions & { vibrate?: number[]; renotify?: boolean };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const rawUrl =
    event.notification.data && typeof event.notification.data === "object"
      ? (event.notification.data as { url?: string }).url
      : undefined;
  const targetUrl = rawUrl && rawUrl.startsWith("/") ? rawUrl : "/notifications";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of allClients) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            await (client as WindowClient).navigate(targetUrl);
          }
          return;
        }
      }

      await self.clients.openWindow(targetUrl);
    })()
  );
});
