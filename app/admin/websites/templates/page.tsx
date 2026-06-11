import { redirect } from "next/navigation";

export default function LegacyWebsiteTemplatesPage() {
  redirect("/admin/websites");
}
