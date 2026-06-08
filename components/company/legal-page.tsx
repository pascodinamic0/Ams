import Link from "next/link";

export function LegalPage({
  title,
  description,
  lastUpdated,
  children,
}: {
  title: string;
  description: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 dark:bg-[#0a0f1e]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400"
        >
          &larr; Back to home
        </Link>
        <header className="mt-8 border-b border-slate-200 pb-8 dark:border-slate-800">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            {description}
          </p>
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
            Last updated: {lastUpdated}
          </p>
        </header>
        <article className="mt-10 space-y-6 text-base leading-relaxed text-slate-600 dark:text-slate-300 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h2]:pt-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:font-medium [&_a]:text-indigo-600 [&_a]:underline-offset-2 hover:[&_a]:underline dark:[&_a]:text-indigo-400 [&_strong]:font-semibold [&_strong]:text-slate-800 dark:[&_strong]:text-slate-200">
          {children}
        </article>
      </div>
    </div>
  );
}
