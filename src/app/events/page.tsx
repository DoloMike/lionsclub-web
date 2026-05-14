import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { SitePhotoBanner } from "@/components/site-photos/SitePhotoBanner";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getChapterEvents } from "@/lib/data/chapter-content";
import { getPublishedSitePhotosBySection } from "@/lib/data/site-photos";
import { getPublishedVolunteerEvents } from "@/lib/data/volunteer-signups";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming and recurring events—parades, screenings, and fundraisers for the Lewisport Lions.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const [events, volunteerEvents, bannerPhotos] = await Promise.all([
    getChapterEvents(),
    isSupabaseConfigured()
      ? getPublishedVolunteerEvents().catch(() => [])
      : Promise.resolve([]),
    isSupabaseConfigured()
      ? getPublishedSitePhotosBySection("events-banner").catch(() => [])
      : Promise.resolve([]),
  ]);
  const hasAnyAnnouncement =
    events.length > 0 || volunteerEvents.length > 0;

  return (
    <>
      <PageHeader
        title="Events & calendar"
        description="Parades, screenings, fundraisers, and chapter meetings—published by chapter admins."
      />
      {bannerPhotos.length > 0 ? (
        <SitePhotoBanner
          photos={bannerPhotos}
          ariaLabel="Events photo highlights"
        />
      ) : null}
      <Prose>
        {!hasAnyAnnouncement ? (
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
        ) : null}
        {events.length > 0 ? (
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
        ) : null}
        {volunteerEvents.length > 0 ? (
          <>
            <h2>Volunteer Sign-Ups</h2>
            <p className="text-muted-foreground">
              Sign in with Google to add yourself to a shift.
            </p>
            <ul>
              {volunteerEvents.map((ev) => (
                <li key={ev.id}>
                  <Link href={`/volunteer/${ev.slug}`}>{ev.title}</Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <h2>Recurring Touchpoints</h2>
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
