import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WebsiteEditorForm } from "@/components/schools/website-editor-form";
import { getSchoolById } from "@/lib/db";

export default async function AdminWebsiteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await getSchoolById(id);

  if (!school) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/websites"
            className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
          >
            &larr; School Websites
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{school.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Customize every section of the public school website.
          </p>
        </div>
        <div className="flex gap-2">
          {school.public_site_enabled && (
            <a href={`/schools/${school.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Preview site</Button>
            </a>
          )}
          <Link href={`/admin/schools/${school.id}`}>
            <Button variant="ghost">School settings</Button>
          </Link>
        </div>
      </div>

      <WebsiteEditorForm school={school} />
    </div>
  );
}
