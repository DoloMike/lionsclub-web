import Link from "next/link";
import { Container } from "@/components/Container";
import { ExternalLink } from "@/components/ExternalLink";
import { LionsLogo } from "@/components/LionsLogo";
import { SocialIcon, type SocialNetwork } from "@/components/SocialIcon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { SocialLinkRow } from "@/lib/data/chapter-content";
import { mainNav } from "@/lib/nav";
import { site } from "@/lib/site";

function iconKeyToNetwork(key: string): SocialNetwork {
  switch (key) {
    case "facebook":
    case "instagram":
    case "youtube":
    case "x":
    case "linkedin":
    case "blog":
    case "link":
      return key;
    default:
      return "link";
  }
}

export function Footer({
  meetingSchedule,
  socialLinks,
}: {
  meetingSchedule: string;
  socialLinks: SocialLinkRow[];
}) {
  return (
    <footer className="mt-auto border-t border-border bg-gradient-to-b from-accent/[0.06] to-muted/45 dark:from-transparent dark:to-muted/40">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="mb-4 inline-block rounded-md dark:bg-white dark:px-2 dark:py-1.5 dark:shadow-[0_1px_3px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.04)] dark:ring-1 dark:ring-black/5">
              <LionsLogo
                className="h-8 w-auto max-w-[180px]"
                alt="Lions Clubs International"
              />
            </span>
            <Eyebrow>{site.name}</Eyebrow>
            <p className="mt-2 text-sm text-muted-foreground">{site.location}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {site.district}
            </p>
            <p className="mt-3 text-sm leading-snug text-muted-foreground">
              {site.address.displayLine}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Meetings</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {meetingSchedule}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {site.meeting.place}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Explore</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Contact</h2>
            <p className="mt-2 text-sm">
              <ExternalLink
                className="text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                href={`mailto:${site.contact.email}`}
              >
                {site.contact.email}
              </ExternalLink>
            </p>
            {site.contact.phone ? (
              <p className="mt-1 text-sm">
                <ExternalLink
                  className="text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                  href={`tel:${site.contact.phone.replace(/\D/g, "")}`}
                >
                  {site.contact.phone}
                </ExternalLink>
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Phone not published — email us anytime.
              </p>
            )}
            <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Social &amp; LCI
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {socialLinks.map((s) => (
                <li key={s.id}>
                  <ExternalLink
                    href={s.url}
                    className="group inline-flex items-center gap-2.5 rounded-md py-1 text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                  >
                    <SocialIcon
                      network={iconKeyToNetwork(s.icon_key)}
                      className="h-[1.125rem] w-[1.125rem] shrink-0 opacity-80 transition group-hover:opacity-100 sm:h-5 sm:w-5"
                    />
                    <span>{s.label}</span>
                  </ExternalLink>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              <ExternalLink
                href={site.lcifUrl}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                LCIF &amp; global programs
              </ExternalLink>
            </p>
          </div>
        </div>
        <div className="mt-10 rounded-2xl border border-border bg-section-warm px-5 py-6 sm:px-8">
          <h2 className="text-sm font-semibold text-foreground">
            Local chapter, local service
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {site.shortName} is a volunteer chapter of Lions Clubs
            International. We meet at the community center, publish updates on
            this site, and run fundraisers like chicken cooks to fund programs
            in Hancock County. For questions about the site, orders, or
            meetings, email{" "}
            <a
              href={`mailto:${site.contact.email}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {site.contact.email}
            </a>
            .
          </p>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            This site is operated by the chapter. It is not an official legal
            statement of Lions Clubs International.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/admin/login" className="hover:text-foreground">
              Admin login
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
