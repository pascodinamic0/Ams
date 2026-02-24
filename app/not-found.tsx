import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-zinc-600">Page not found</p>
      <Link href="/" className="mt-6 text-zinc-900 underline dark:text-zinc-100">
        Go home
      </Link>
    </div>
  );
}
