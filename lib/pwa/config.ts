import { companyIdentity } from "@/lib/company/identity";
import { pwaIconPath, pwaMaskableIconPath } from "@/lib/pwa/assets";
import type { MetadataRoute } from "next";

export const pwaThemeColor = companyIdentity.brand.primary;
export const pwaBackgroundColor = companyIdentity.brand.background;

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512] as const;

export function buildPwaManifest(): MetadataRoute.Manifest {
  return {
    name: companyIdentity.productFullName,
    short_name: companyIdentity.productName,
    description: `${companyIdentity.tagline}. Academics, fees, and parent communication in one place.`,
    start_url: "/login",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: pwaBackgroundColor,
    theme_color: pwaThemeColor,
    categories: ["education", "productivity", "business"],
    icons: [
      ...iconSizes.map((size) => ({
        src: pwaIconPath(size),
        sizes: `${size}x${size}`,
        type: "image/png" as const,
        purpose: "any" as const,
      })),
      {
        src: pwaMaskableIconPath,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Sign in",
        short_name: "Login",
        url: "/login",
        description: "Open your ShuleOS dashboard",
      },
      {
        name: "Attendance",
        short_name: "Attendance",
        url: "/teacher/attendance",
        description: "Mark class attendance",
      },
    ],
  };
}
