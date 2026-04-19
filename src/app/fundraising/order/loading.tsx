import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function FundraisingOrderLoading() {
  return (
    <>
      <PageHeader title="Order chicken" />
      <Container className="py-8">
        <div
          className="mx-auto max-w-xl space-y-6"
          aria-busy="true"
          aria-label="Loading order form"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-11 w-32 rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
          <SkeletonText lines={1} className="max-w-sm" />
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-12 w-40 rounded-full" />
          </div>
        </div>
      </Container>
    </>
  );
}
