export function RouteLoading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 py-2" role="status" aria-live="polite" aria-label={label}>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800" />
    </div>
  );
}
