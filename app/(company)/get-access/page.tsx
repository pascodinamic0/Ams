import Link from "next/link";

export default function GetAccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Get access as a school
      </h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        Sign up your school and get started in minutes. Connect your domain later,
        use our guided onboarding wizard, and have a working site and portal from
        day one.
      </p>
      <Link
        href="/register"
        className="mt-8 inline-block rounded-lg bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Get access as a school
      </Link>
    </div>
  );
}
