import { Skeleton } from "./skeleton";

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <Skeleton className="mb-4 h-6 w-1/3" />
      <Skeleton className="mb-2 h-8 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function CardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
