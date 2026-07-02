import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { PwaRoot } from "@/components/pwa/pwa-root";
import { companyIdentity } from "@/lib/company/identity";
import { pwaBackgroundColor, pwaThemeColor } from "@/lib/pwa/config";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: companyIdentity.productFullName,
  description:
    `${companyIdentity.productName} — school management platform built in Nairobi, Kenya. Academics, fees, M-Pesa payments, and parent communication in one place.`,
  applicationName: companyIdentity.productName,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: companyIdentity.productName,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
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

  return (
    <html lang={locale}>
      <body
        className={`${jakartaSans.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ backgroundColor: pwaBackgroundColor }}
      >
        <NextIntlClientProvider messages={messages}>
          <PwaRoot>{children}</PwaRoot>
          <Toaster position="top-right" richColors closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
