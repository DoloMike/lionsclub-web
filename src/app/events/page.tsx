import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import Link from "next/link";
import { getChapterEvents } from "@/lib/data/chapter-content";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming and recurring events—parades, screenings, and fundraisers for the Lewisport Lions.",
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
          <div className="not-prose rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <p className="text-base font-semibold text-foreground">
              No upcoming events published yet
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              The chapter adds parades, screenings, meetings, and fundraisers
              here when dates are set.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Contact the club
              </Link>
              <Link
                href="/membership"
                className="inline-flex rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-card-foreground transition hover:bg-muted"
              >
                Membership &amp; meetings
              </Link>
            </div>
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
