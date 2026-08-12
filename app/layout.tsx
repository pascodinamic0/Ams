import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { JetBrains_Mono, Outfit, Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import { getLocale, getMessages, getTimeZone, getTranslations } from "next-intl/server";
import { AppIntlProvider } from "@/components/i18n/app-intl-provider";
import { AppToaster } from "@/components/ui/app-toaster";
import { PwaRoot } from "@/components/pwa/pwa-root";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { companyIdentity } from "@/lib/company/identity";
import { pickClientMessages } from "@/lib/i18n/client-messages";
import { pwaAppleTouchIconPath, pwaIconPath, withPwaAssetRevision } from "@/lib/pwa/assets";
import { pwaThemeColor } from "@/lib/pwa/config";
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

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketing");
  return {
    title: companyIdentity.productFullName,
    description: t("metaDescription"),
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
        { url: withPwaAssetRevision("/favicon.ico"), sizes: "32x32" },
        { url: pwaIconPath(192), sizes: "192x192", type: "image/png" },
        { url: pwaIconPath(512), sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: pwaAppleTouchIconPath, sizes: "180x180", type: "image/png" }],
    },
  };
}

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
  const timeZone = await getTimeZone();
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
      className={`${jakartaSans.variable} ${jetbrainsMono.variable} ${sourceSerif.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background antialiased text-foreground">
        <AppIntlProvider locale={locale} timeZone={timeZone} messages={clientMessages}>
          <ThemeProvider>
            <PwaRoot>{children}</PwaRoot>
            <AppToaster />
          </ThemeProvider>
        </AppIntlProvider>
      </body>
    </html>
  );
}
