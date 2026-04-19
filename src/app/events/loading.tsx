import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function EventsLoading() {
  return (
    <>
      <PageHeader
        title="Events & calendar"
        description="Parades, screenings, fundraisers, and chapter meetings—published by chapter admins."
      />
      <Container className="py-8">
        <div
          className="space-y-4"
          aria-busy="true"
          aria-label="Loading events"
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="mt-2 h-5 w-2/3 max-w-md rounded" />
              <SkeletonText lines={1} className="mt-2" />
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
