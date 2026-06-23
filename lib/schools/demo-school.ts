import type { SchoolRow } from "@/lib/db/schools";
import type { WebsiteTemplateId } from "./website-templates";
import { getWebsiteTemplate } from "./website-templates";
import {
  DEFAULT_HERO_IMAGE,
  getPreviewWebsiteContent,
} from "./website-content";

export function createDemoSchool(template: WebsiteTemplateId): SchoolRow {
  const meta = getWebsiteTemplate(template)!;
  const content = getPreviewWebsiteContent("Greenfield Academy");

  return {
    id: "00000000-0000-0000-0000-000000000000",
    name: "Greenfield Academy",
    slug: "greenfield-academy",
    code: "DEMO",
    logo_url: null,
    cover_image_url: DEFAULT_HERO_IMAGE,
    about:
      "Greenfield Academy nurtures curious minds through rigorous academics, creative arts, and community service. Our graduates are prepared for university and life beyond the classroom.",
    contact_email: "hello@greenfield.edu",
    contact_phone: "+1 (555) 012-3456",
    address: "42 Learning Lane, Greenfield",
    theme_primary_color: meta.defaultPrimary,
    theme_secondary_color: meta.defaultSecondary,
    website_template: template,
    website_content: content,
    custom_domain: null,
    public_site_enabled: true,
    status: "approved",
    owner_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
