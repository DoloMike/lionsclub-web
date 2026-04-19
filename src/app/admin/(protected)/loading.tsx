import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function AdminProtectedLoading() {
  return (
    <div
      className="space-y-5 py-2"
      aria-busy="true"
      aria-label="Loading admin page"
    >
      <Skeleton className="h-8 w-48 max-w-full rounded-lg" />
      <SkeletonText lines={2} lineClassName="h-4" />
      <div className="mt-8 space-y-3 rounded-xl border border-border bg-card/50 p-5 shadow-sm">
        <Skeleton className="h-4 w-3/4 max-w-md rounded-md" />
        <Skeleton className="h-28 w-full max-w-xl rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
    </div>
  );
}
