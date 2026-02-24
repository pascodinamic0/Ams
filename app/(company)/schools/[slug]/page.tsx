import Link from "next/link";

export default async function SchoolHomepage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold capitalize">{slug.replace(/-/g, " ")}</h1>
      <p className="mt-4 text-zinc-600">School homepage - About, Contact, CTA</p>
      <Link
        href={`/schools/${slug}/admissions`}
        className="mt-8 inline-block rounded-lg bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-800"
      >
        Apply for Admissions
      </Link>
    </div>
  );
}
