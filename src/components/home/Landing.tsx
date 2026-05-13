import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { ExternalLink } from "@/components/ExternalLink";
import { ButtonLink, buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { googleMapsSearchUrl } from "@/lib/maps-links";
import { site } from "@/lib/site";

const heroAddressMapsUrl = googleMapsSearchUrl(site.address.displayLine);

const programs = [
  {
    title: "Vision & Hearing",
    body: "Eyeglass collection, cleaning, and distribution; help with exams and glasses; connections to Kentucky Lions Eye Foundation and surgery where eligible.",
  },
  {
    title: "Screenings",
    body: "Vision Van for adults and KidSight for young children (about 5 months through 5 years).",
  },
  {
    title: "Youth & Education",
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
    title: "Real-world help",
    body: "Eyeglasses, screenings, scholarships, and hands-on community support.",
  },
  {
    title: "Accountable",
    body: "Led by member volunteers; funds and projects stewarded locally.",
  },
] as const;

/**
 * On mobile (`flex-col`) the primary CTA used to stretch via `flex` while the
 * secondary stayed intrinsic-width, leaving the row visually unbalanced.
 * Forcing `w-full sm:w-auto` on every direct child fixes it without any
 * per-button changes.
 */
const ctaRow =
  "mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto";

const heritageFestivalCallout = {
  eyebrow: "Volunteer spotlight",
  title: "Heritage Festival 2026 signup",
  body:
    "Sign up for booth setup, festival days, and booth tear down so every shift is covered.",
  href: "/heritage-festival-2026-signup",
} as const;

export function Landing() {
  return (
    <>
      <section
        className="bg-gradient-to-b from-section-warm via-muted/30 to-background"
        aria-labelledby="hero-heading"
      >
        <Container className="py-16 sm:py-24 lg:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <Eyebrow tone="primary">
                {site.location} · {site.district}
              </Eyebrow>
              <h1
                id="hero-heading"
                className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
              >
                Serving Hancock County as{" "}
                <span className="text-primary">{site.shortName}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Vision and hearing programs, youth support, scholarships, and
                community events, we&apos;re your neighbors, improving health and
                opportunity close to home.
              </p>
              <div className={ctaRow}>
                <ButtonLink href="/membership" size="lg">
                  Join us
                </ButtonLink>
                <ButtonLink href="/contact" variant="secondary" size="lg">
                  Contact
                </ButtonLink>
              </div>
            </div>
            <Card
              padding="md"
              ring
              className="relative overflow-hidden transition-shadow duration-200 hover:shadow-card-hover lg:col-span-5"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent/15 blur-2xl"
                aria-hidden
              />
              <div className="overflow-hidden rounded-2xl border border-primary/15 bg-muted/20 shadow-card">
                <Image
                  src="/images/heritage-festival-2026.jpg"
                  alt="Lions Club volunteers and family gathered around a grill outdoors during a community cookout."
                  width={800}
                  height={523}
                  className="h-full w-full object-cover"
                  sizes="(min-width: 1024px) 32rem, 100vw"
                  priority
                />
              </div>
              <Eyebrow className="mt-5">In our community</Eyebrow>
              <p className="mt-3 text-sm font-medium leading-relaxed text-foreground">
                Meetings, cookouts, and service projects are rooted at{" "}
                <span className="text-primary">{site.address.venue}</span>.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                <ExternalLink
                  href={heroAddressMapsUrl}
                  className="text-muted-foreground underline-offset-2 transition hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={`Open ${site.address.displayLine} in Google Maps`}
                >
                  {site.address.displayLine}
                </ExternalLink>
              </p>
              <Link
                href="/about"
                className="mt-5 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                About the chapter
              </Link>
            </Card>
          </div>
        </Container>
      </section>

      <section className="border-b border-border/60 bg-primary/5 py-12" aria-labelledby="heritage-festival-signup-callout">
        <Container>
          <Card padding="xl" ring className="border-primary/20 bg-background/90">
            <Eyebrow tone="primary">{heritageFestivalCallout.eyebrow}</Eyebrow>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2
                  id="heritage-festival-signup-callout"
                  className="text-2xl font-bold tracking-tight text-foreground"
                >
                  {heritageFestivalCallout.title}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {heritageFestivalCallout.body}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  See the crew in action at the top of the homepage, then claim a shift and help keep the booth running strong.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row [&>*]:w-full sm:[&>*]:w-auto">
                <ButtonLink href={heritageFestivalCallout.href} size="lg">
                  Sign up for Heritage Festival 2026
                </ButtonLink>
                <ButtonLink href="/contact" variant="secondary" size="lg">
                  Ask a question
                </ButtonLink>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      <section className="py-14" aria-labelledby="mission">
        <Container>
          <h2
            id="mission"
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            Mission &amp; Impact
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
        className="border-y border-border/60 bg-muted/30 py-14"
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
          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {programs.map((p) => (
              <li
                key={p.title}
                className="rounded-xl border border-border/70 bg-card/60 p-6"
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
        className="border-y border-border/60 bg-muted/30 py-14"
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
                When a cook is scheduled, you can review dates and order online
                with secure checkout—orders are saved only after payment. Watch
                this section and the site banner for the next round.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row [&>*]:w-full sm:[&>*]:w-auto">
              <ButtonLink href="/fundraising" size="lg">
                Fundraising details
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary" size="lg">
                Get notified
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14" aria-labelledby="membership-cta">
        <Container>
          <Card padding="xl">
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
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto">
              <ButtonLink href="/membership" size="lg">
                Membership information
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary" size="lg">
                Ask a question
              </ButtonLink>
            </div>
          </Card>
        </Container>
      </section>

      <section
        className="border-t border-border/60 bg-muted/20 py-14"
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
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto">
            <ButtonLink href="/contact" size="lg">
              Contact about giving locally
            </ButtonLink>
            <ExternalLink
              href={site.lcifUrl}
              className={buttonClassName({ variant: "secondary", size: "lg" })}
            >
              Learn about LCIF
            </ExternalLink>
          </div>
        </Container>
      </section>

      <section className="border-t border-border/60 py-14" aria-labelledby="contact-teaser">
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
