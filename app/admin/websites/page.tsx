import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WebsiteTemplatesGallery } from "./template-gallery";

export default function AdminWebsitesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Website templates</h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Pre-built school website designs available when onboarding a new school.
            Preview any template live, then assign it during school setup. To edit a
            specific school&apos;s site, open that school from Schools.
          </p>
        </div>
        <Link href="/admin/schools/new">
          <Button>Onboard school</Button>
        </Link>
      </div>

      <WebsiteTemplatesGallery />
    </div>
  );
}
