import { Skeleton } from "@/components/ui/Skeleton";

/** Matches fundraiser banner chrome while personalized segments load. */
export function FundraiserOrderBannerSkeleton({
  blocks = 1,
}: {
  blocks?: number;
}) {
  return (
    <>
      {Array.from({ length: blocks }, (_, i) => (
        <div
          key={i}
          className="campaign-banner border-b border-amber-300/80 bg-gradient-to-r from-amber-100/90 via-amber-50/90 to-amber-100/90 ring-1 ring-inset ring-accent/20 dark:border-amber-900/50 dark:from-amber-950/40 dark:via-amber-950/25 dark:to-amber-950/40 dark:ring-accent/15"
          aria-busy="true"
          aria-label="Loading fundraiser banner"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-[min(100%,20rem)] rounded-md" />
              <Skeleton className="h-3.5 w-full max-w-xl rounded-md" />
              <Skeleton className="h-3.5 w-4/5 max-w-lg rounded-md" />
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
              <Skeleton className="h-10 w-36 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
