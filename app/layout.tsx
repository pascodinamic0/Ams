import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { JetBrains_Mono, Plus_Jakarta_Sans, Silkscreen } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AppToaster } from "@/components/ui/app-toaster";
import { PwaRoot } from "@/components/pwa/pwa-root";
import { companyIdentity } from "@/lib/company/identity";
import { pickClientMessages } from "@/lib/i18n/client-messages";
import { pwaBackgroundColor, pwaThemeColor } from "@/lib/pwa/config";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: companyIdentity.productFullName,
  description:
    `${companyIdentity.productName} — school management platform built for DRC schools. Academics, fees, mobile money payments, and parent communication in one place.`,
  applicationName: companyIdentity.productName,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: companyIdentity.productName,
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: "q1glprMjA9uq5ly27fzf-bVzUhZVZkU-v9vFXAtunII",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: pwaThemeColor },
    { media: "(prefers-color-scheme: dark)", color: "#14b8a6" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const headerStore = await headers();
  // Prefer proxy-injected path; if missing (build/prerender), keep full messages.
  const pathname = headerStore.get("x-pathname");
  const clientMessages = pathname
    ? pickClientMessages(messages, pathname)
    : messages;

  return (
    <html
      lang={locale}
      className={`${jakartaSans.variable} ${jetbrainsMono.variable} ${silkscreen.variable}`}
    >
      <body
        className="antialiased"
        style={{ backgroundColor: pwaBackgroundColor }}
      >
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <PwaRoot>{children}</PwaRoot>
          <AppToaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
