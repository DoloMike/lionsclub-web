import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getChapterEvents } from "@/lib/data/chapter-content";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming and recurring events—parades, screenings, and fundraisers for the Lewisport Lions.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const events = await getChapterEvents();

  return (
    <>
      <PageHeader
        title="Events & calendar"
        description="Parades, screenings, fundraisers, and chapter meetings—published by chapter admins."
      />
      <Prose>
        {events.length === 0 ? (
          <div className="not-prose">
            <EmptyState
              title="No upcoming events published yet"
              description="The chapter adds parades, screenings, meetings, and fundraisers here when dates are set."
              actions={
                <>
                  <ButtonLink href="/contact">Contact the club</ButtonLink>
                  <ButtonLink href="/membership" variant="secondary">
                    Membership &amp; meetings
                  </ButtonLink>
                </>
              }
            />
          </div>
        ) : (
          <ul>
            {events.map((ev) => (
              <li key={ev.id}>
                <strong>{ev.event_date}</strong> — {ev.title}
                {ev.description ? (
                  <>
                    {" "}
                    <span className="text-muted-foreground">({ev.description})</span>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <h2>Recurring touchpoints</h2>
        <ul>
          <li>Christmas parade morning pancake breakfast</li>
          <li>Santa float — Lewisport and Hawesville parades</li>
          <li>Vision screenings (Vision Van, KidSight) when scheduled</li>
          <li>Chicken cook fundraisers — see Fundraising</li>
        </ul>
      </Prose>
    </>
  );
}
