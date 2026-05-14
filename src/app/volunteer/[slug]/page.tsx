import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import {
  VolunteerSignupTable,
  type VolunteerSignupTableViewer,
} from "@/components/volunteer-signups/VolunteerSignupTable";
import { addVolunteerSignup, removeMyVolunteerSignup } from "./actions";
import { deriveDisplayName } from "@/lib/auth/display-name";
import { getSessionUser } from "@/lib/auth/get-session";
import { getVolunteerEventBySlug } from "@/lib/data/volunteer-signups";
import { isSupabaseConfigured } from "@/lib/env";

type RouteParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isSupabaseConfigured()) {
    return { title: "Volunteer sign up" };
  }
  const event = await getVolunteerEventBySlug(slug).catch(() => null);
  if (!event) return { title: "Volunteer sign up" };
  return {
    title: `${event.title} sign up`,
    description:
      event.description ?? `Sign up to volunteer for ${event.title}.`,
    alternates: { canonical: `/volunteer/${event.slug}` },
  };
}

export default async function VolunteerEventSignupPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  if (!isSupabaseConfigured()) {
    notFound();
  }
  const event = await getVolunteerEventBySlug(slug).catch(() => null);
  if (!event) {
    notFound();
  }

  const sessionUser = await getSessionUser();
  const viewer: VolunteerSignupTableViewer | null = sessionUser
    ? { id: sessionUser.id, displayName: deriveDisplayName(sessionUser) }
    : null;

  const showProse = Boolean(event.description) || !event.signupsOpen;

  return (
    <>
      <PageHeader
        title={`${event.title} sign up`}
        description={
          viewer
            ? `Pick a shift below and we'll add you as ${viewer.displayName}.`
            : "Sign in with Google to add yourself to a shift."
        }
      />
      {showProse ? (
        <Prose>
          {event.description ? (
            <p className="whitespace-pre-line">{event.description}</p>
          ) : null}
          {!event.signupsOpen ? (
            <p>
              Sign-ups for this event are not currently open. You can still see
              who has signed up below.
            </p>
          ) : null}
        </Prose>
      ) : null}
      <div
        className={`mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8 ${
          showProse ? "mt-6" : "mt-8 sm:mt-10"
        }`}
      >
        <VolunteerSignupTable
          eventSlug={event.slug}
          shifts={event.shifts}
          viewer={viewer}
          addSignup={addVolunteerSignup}
          removeMySignup={removeMyVolunteerSignup}
          signupsEnabled={event.signupsOpen}
        />
      </div>
    </>
  );
}
