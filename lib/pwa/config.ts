import { companyIdentity } from "@/lib/company/identity";
import type { MetadataRoute } from "next";

export const pwaThemeColor = "#4f46e5";
export const pwaBackgroundColor = "#ffffff";

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
        src: `/icons/icon-${size}x${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
      })),
      {
        src: "/icons/maskable-icon-512x512.png",
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
