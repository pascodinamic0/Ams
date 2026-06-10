import Link from "next/link";
import type { SchoolRow } from "@/lib/db/schools";

function AdmissionsCta({
  slug,
  primary,
  secondary,
  className = "",
}: {
  slug: string;
  primary: string;
  secondary: string;
  className?: string;
}) {
  return (
    <Link
      href={`/schools/${slug}/admissions`}
      className={className}
      style={{ backgroundColor: primary, color: secondary }}
    >
      Apply for Admissions
    </Link>
  );
}

function ContactBlock({ school }: { school: SchoolRow }) {
  if (!school.contact_email && !school.contact_phone && !school.address) {
    return null;
  }

  return (
    <div className="space-y-2 text-sm">
      {school.contact_email && <p>Email: {school.contact_email}</p>}
      {school.contact_phone && <p>Phone: {school.contact_phone}</p>}
      {school.address && <p>{school.address}</p>}
    </div>
  );
}

function ModernTemplate({ school }: { school: SchoolRow }) {
  const primary = school.theme_primary_color ?? "#3b82f6";
  const secondary = school.theme_secondary_color ?? "#1d4ed8";

  return (
    <div>
      <section
        className="rounded-2xl px-8 py-16 text-white"
        style={{
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
        }}
      >
        <div className="mx-auto max-w-4xl">
          {school.logo_url && (
            <img
              src={school.logo_url}
              alt={`${school.name} logo`}
              className="mb-6 h-16 w-16 rounded-xl bg-white/10 object-cover"
            />
          )}
          <h1 className="text-4xl font-bold tracking-tight">{school.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90">
            {school.about ?? "Welcome to our school community."}
          </p>
          <AdmissionsCta
            slug={school.slug}
            primary="#ffffff"
            secondary={primary}
            className="mt-8 inline-block rounded-lg px-6 py-3 font-medium hover:opacity-90"
          />
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">About us</h2>
          <p className="mt-3 text-zinc-600">
            {school.about ?? "Learn more about our programs and community."}
          </p>
        </div>
        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Contact</h2>
          <div className="mt-3 text-zinc-600">
            <ContactBlock school={school} />
          </div>
        </div>
      </section>
    </div>
  );
}

function ClassicTemplate({ school }: { school: SchoolRow }) {
  const primary = school.theme_primary_color ?? "#1e3a8a";

  return (
    <div className="mx-auto max-w-4xl border-2 border-zinc-300 bg-zinc-50">
      <header
        className="border-b-2 border-zinc-300 px-8 py-10 text-center"
        style={{ borderBottomColor: primary }}
      >
        {school.logo_url && (
          <img
            src={school.logo_url}
            alt={`${school.name} logo`}
            className="mx-auto mb-4 h-20 w-20 object-cover"
          />
        )}
        <h1
          className="font-serif text-4xl font-bold tracking-wide"
          style={{ color: primary }}
        >
          {school.name}
        </h1>
        <p className="mt-3 text-zinc-600">
          {school.about ?? "Excellence in education since establishment."}
        </p>
      </header>

      <div className="grid gap-0 md:grid-cols-2">
        <section className="border-b border-r border-zinc-300 p-8 md:border-b-0">
          <h2 className="font-serif text-xl font-semibold">About</h2>
          <p className="mt-4 leading-relaxed text-zinc-700">
            {school.about ?? "We are committed to nurturing every student."}
          </p>
        </section>
        <section className="p-8">
          <h2 className="font-serif text-xl font-semibold">Contact</h2>
          <div className="mt-4 text-zinc-700">
            <ContactBlock school={school} />
          </div>
        </section>
      </div>

      <footer className="border-t-2 border-zinc-300 p-8 text-center">
        <AdmissionsCta
          slug={school.slug}
          primary={primary}
          secondary="#ffffff"
          className="inline-block rounded px-8 py-3 font-medium hover:opacity-90"
        />
      </footer>
    </div>
  );
}

function MinimalTemplate({ school }: { school: SchoolRow }) {
  const primary = school.theme_primary_color ?? "#18181b";

  return (
    <div className="mx-auto max-w-2xl px-2 py-8">
      {school.logo_url && (
        <img
          src={school.logo_url}
          alt={`${school.name} logo`}
          className="mb-8 h-12 w-12 object-cover"
        />
      )}
      <h1 className="text-3xl font-light tracking-tight" style={{ color: primary }}>
        {school.name}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-zinc-600">
        {school.about ?? "A focused learning environment."}
      </p>

      <div className="mt-12 space-y-8 border-t border-zinc-200 pt-12">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            Contact
          </h2>
          <div className="mt-4 text-zinc-600">
            <ContactBlock school={school} />
          </div>
        </div>

        <AdmissionsCta
          slug={school.slug}
          primary={primary}
          secondary="#ffffff"
          className="inline-block border border-current px-6 py-2 text-sm hover:opacity-80"
        />
      </div>
    </div>
  );
}

export function SchoolHomeTemplate({ school }: { school: SchoolRow }) {
  const template = school.website_template ?? "modern";

  switch (template) {
    case "classic":
      return <ClassicTemplate school={school} />;
    case "minimal":
      return <MinimalTemplate school={school} />;
    default:
      return <ModernTemplate school={school} />;
  }
}
