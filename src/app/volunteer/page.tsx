import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { getPublishedVolunteerEvents } from "@/lib/data/volunteer-signups";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Volunteer Sign Ups",
  description:
    "Sign up for upcoming volunteer opportunities with the Lewisport Lions Club.",
  alternates: { canonical: "/volunteer" },
};

export default async function VolunteerIndexPage() {
  const events = isSupabaseConfigured()
    ? await getPublishedVolunteerEvents().catch(() => [])
    : [];

  return (
    <>
      <PageHeader
        title="Volunteer Sign Ups"
        description="Open volunteer opportunities with the Lewisport Lions Club."
      />
      <div className="mx-auto mt-8 max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        {events.length === 0 ? (
          <Prose>
            <p>
              No volunteer events are accepting signups right now. Check back
              soon, or{" "}
              <Link
                href="/contact"
                className="text-primary underline-offset-4 hover:underline"
              >
                reach out
              </Link>{" "}
              to let us know you&apos;d like to help.
            </p>
          </Prose>
        ) : (
          <ul className="space-y-4">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <Link
                  href={`/volunteer/${ev.slug}`}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <h2 className="text-lg font-bold text-foreground">
                    {ev.title}
                  </h2>
                  {ev.description ? (
                    <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
                      {ev.description}
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm font-medium text-primary">
                    {ev.signupsOpen ? "Sign up →" : "View signups →"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
