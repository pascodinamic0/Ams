import type { SchoolRow } from "@/lib/db/schools";
import type { WebsiteTemplateId } from "./website-templates";
import { getWebsiteTemplate } from "./website-templates";
import {
  DEFAULT_HERO_IMAGE,
  getPreviewWebsiteContent,
} from "./website-content";

export function createDemoSchool(template: WebsiteTemplateId): SchoolRow {
  const meta = getWebsiteTemplate(template)!;
  const content = getPreviewWebsiteContent("École Horizon Kinshasa");

  return {
    id: "00000000-0000-0000-0000-000000000000",
    name: "École Horizon Kinshasa",
    slug: "ecole-horizon-kinshasa",
    code: "DEMO",
    logo_url: null,
    cover_image_url: DEFAULT_HERO_IMAGE,
    about:
      "École Horizon Kinshasa serves families across Gombe and Lingwala with Programme National academics, French-first communication, and clear fee tracking for every term.",
    contact_email: "accueil@ecolehorizon.cd",
    contact_phone: "+243 822 378 097",
    address: "Avenue Batetela, Gombe, Kinshasa, RDC",
    theme_primary_color: meta.defaultPrimary,
    theme_secondary_color: meta.defaultSecondary,
    website_template: template,
    website_content: content,
    custom_domain: null,
    public_site_enabled: true,
    status: "approved",
    owner_id: null,
    currency_code: "CDF",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
