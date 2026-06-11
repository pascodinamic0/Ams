import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SchoolTemplatesGallery } from "./template-gallery";

export default function WebsiteTemplatesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin/websites"
            className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
          >
            &larr; School Websites
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Website templates</h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Pre-built, modern school websites ready from day one. Preview any design live,
            then start onboarding with your chosen template.
          </p>
        </div>
        <Link href="/admin/schools/new">
          <Button>Start school onboarding</Button>
        </Link>
      </div>

      <SchoolTemplatesGallery />
    </div>
  );
}
