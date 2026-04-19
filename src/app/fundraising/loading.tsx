import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function FundraisingLoading() {
  return (
    <>
      <PageHeader title="Fundraising" />
      <Container className="py-8">
        <div
          className="space-y-6"
          aria-busy="true"
          aria-label="Loading fundraising content"
        >
          <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
          <SkeletonText lines={2} className="max-w-xl" />
          <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </div>
      </Container>
    </>
  );
}
