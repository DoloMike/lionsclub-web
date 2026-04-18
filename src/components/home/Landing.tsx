import Link from "next/link";
import { Container } from "@/components/Container";
import { site } from "@/lib/site";

const programs = [
  {
    title: "Vision & hearing",
    body: "Eyeglass collection, cleaning, and distribution; help with exams and glasses; connections to Kentucky Lions Eye Foundation and surgery where eligible.",
  },
  {
    title: "Screenings",
    body: "Vision Van for adults and KidSight for young children (about 5 months through 5 years).",
  },
  {
    title: "Youth & education",
    body: "Scholarships for Hancock County High School seniors and support for local youth programs.",
  },
  {
    title: "Community traditions",
    body: "Free pancake breakfast on Christmas parade morning and a Santa float for Lewisport and Hawesville parades.",
  },
  {
    title: "County partners",
    body: "Build a Bed, Hancock County Fairgrounds, Care and Share, meeting space for qualifying nonprofits, and more as needs arise.",
  },
  {
    title: "Lions worldwide",
    body: "Leader Dogs for the Blind, Lions Camp Crescendo, and LCIF grants that complement local service.",
  },
] as const;

const impact = [
  {
    title: "Neighbors first",
    body: "We live and work here—service starts with Hancock County.",
  },
  {
    title: "Concrete help",
    body: "Eyeglasses, screenings, scholarships, and hands-on community support.",
  },
  {
    title: "Accountable",
    body: "Led by member volunteers; funds and projects stewarded locally.",
  },
] as const;

export function Landing() {
  return (
    <>
      <section
        className="border-b border-border bg-gradient-to-b from-muted/50 to-background"
        aria-labelledby="hero-heading"
      >
        <Container className="py-16 sm:py-24 lg:py-28">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            {site.location} · {site.district}
          </p>
          <h1
            id="hero-heading"
            className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            Serving Hancock County as{" "}
            <span className="text-primary">{site.shortName}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Vision and hearing programs, youth support, scholarships, and
            community events—we&apos;re your neighbors, improving health and
            opportunity close to home.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/membership"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Join us
            </Link>
            <Link
              href="/fundraising"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-card-foreground shadow-sm transition hover:bg-muted"
            >
              Chicken cook orders
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Contact
            </Link>
          </div>
        </Container>
      </section>

      <section className="border-b border-border py-14" aria-labelledby="mission">
        <Container>
          <h2
            id="mission"
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            Mission &amp; impact
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            We improve health and opportunity through local programs you can see
            and touch—from eyeglasses and screenings to scholarships and parade
            traditions. We&apos;re part of Lions Clubs International, but our
            story is written in Hancock County.
          </p>
          <p className="mt-6">
            <Link
              href="/service"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              See what we do
            </Link>
          </p>
        </Container>
      </section>

      <section
        className="border-b border-border bg-muted/30 py-14"
        aria-labelledby="impact-strip"
      >
        <Container>
          <h2 id="impact-strip" className="sr-only">
            Impact highlights
          </h2>
          <ul className="grid gap-8 sm:grid-cols-3">
            {impact.map((item) => (
              <li key={item.title}>
                <h3 className="text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-14" aria-labelledby="programs">
        <Container>
          <h2
            id="programs"
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            Programs &amp; community service
          </h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Highlights from our chapter&apos;s public projects—short blurbs, big
            heart.{" "}
            <a
              href={site.eClubhouseUrl}
              className="font-medium text-primary underline-offset-4 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Chapter project list (reference)
            </a>
          </p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {programs.map((p) => (
              <li
                key={p.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-card-foreground">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-10">
            <Link
              href="/membership"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Volunteer with us
            </Link>
          </p>
        </Container>
      </section>

      <section
        className="border-y border-border bg-muted/30 py-14"
        aria-labelledby="fundraiser"
      >
        <Container>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2
                id="fundraiser"
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                Chicken cook fundraiser
              </h2>
              <p className="mt-3 text-muted-foreground">
                A recurring community fundraiser. Online ordering, pickup
                details, and payment options will be announced here—share your
                contact info if you&apos;d like a reminder when the next cook is
                scheduled.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/fundraising"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Fundraising details
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-card-foreground transition hover:bg-muted"
              >
                Get notified
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14" aria-labelledby="membership-cta">
        <Container>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
            <h2
              id="membership-cta"
              className="text-2xl font-bold tracking-tight text-foreground"
            >
              Become a Lion
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Meetings are welcoming. We&apos;ll explain roles and time
              commitments—no pressure, just conversation. Member sign-in for
              accounts is planned for a later phase.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/membership"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Membership information
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Ask a question
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section
        className="border-t border-border bg-muted/20 py-14"
        aria-labelledby="events-teaser"
      >
        <Container>
          <h2
            id="events-teaser"
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            Events &amp; news
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Parades, screenings, fundraisers—what&apos;s next for the chapter.
            We&apos;ll publish a calendar here; for now, reach out if you want to
            partner or attend.
          </p>
          <p className="mt-6">
            <Link
              href="/events"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              View events
            </Link>
          </p>
        </Container>
      </section>

      <section className="py-14" aria-labelledby="donate">
        <Container>
          <h2
            id="donate"
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            Donations &amp; foundation
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Local projects come first. If you want to support Lions&apos; global
            humanitarian work, LCIF is the foundation arm of Lions Clubs
            International.
          </p>
          <p className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Contact about giving locally
            </Link>
            <a
              href={site.lcifUrl}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-card-foreground transition hover:bg-muted"
              rel="noopener noreferrer"
              target="_blank"
            >
              Learn about LCIF
            </a>
          </p>
        </Container>
      </section>

      <section className="border-t border-border py-14" aria-labelledby="contact-teaser">
        <Container>
          <h2
            id="contact-teaser"
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            Contact the club
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Request help, offer to volunteer, or ask about using our meeting
            space for qualifying nonprofits (limited days per year).
          </p>
          <p className="mt-6">
            <Link
              href="/contact"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Message the club
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
