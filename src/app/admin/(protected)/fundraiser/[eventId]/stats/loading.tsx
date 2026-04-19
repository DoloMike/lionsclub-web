import { Skeleton } from "@/components/ui/Skeleton";

export default function FundraiserStatsLoading() {
  return (
    <div
      className="space-y-6 py-2"
      aria-busy="true"
      aria-label="Loading fundraiser stats"
    >
      <Skeleton className="h-4 w-48 rounded-md" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 max-w-full rounded-md" />
          <Skeleton className="h-4 w-56 rounded-md" />
        </div>
        <Skeleton className="h-10 w-48 rounded-full" />
      </div>
      <Skeleton className="h-16 w-full max-w-2xl rounded-md" />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <li
            key={i}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="mt-3 h-8 w-20 rounded-md" />
          </li>
        ))}
      </ul>
      <Skeleton className="h-64 w-full max-w-4xl rounded-lg" />
    </div>
  );
}
