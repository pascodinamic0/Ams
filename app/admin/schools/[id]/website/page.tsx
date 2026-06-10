import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchoolById } from "@/lib/db";
import { WebsiteConfigForm } from "./website-form";

export default async function SchoolWebsitePage({
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
    <div>
      <div className="flex items-center gap-4">
        <Link
          href="/admin/schools"
          className="text-sm text-zinc-600 hover:underline"
        >
          ← Schools
        </Link>
      </div>
      <h1 className="mt-4 text-2xl font-bold">Website — {school.name}</h1>
      <p className="mt-2 text-zinc-600">
        Configure the public school site at /schools/{school.slug}
      </p>
      <WebsiteConfigForm school={school} />
    </div>
  );
}
