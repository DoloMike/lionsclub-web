import Link from "next/link";
import { Container } from "@/components/Container";
import { mainNav } from "@/lib/nav";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {site.name}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{site.location}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {site.district}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Meetings</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {site.meeting.schedule}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
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
              <a
                className="text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                href={`mailto:${site.contact.email}`}
              >
                {site.contact.email}
              </a>
            </p>
            <p className="mt-1 text-sm">
              <a
                className="text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
                href={`tel:${site.contact.phone.replace(/\D/g, "")}`}
              >
                {site.contact.phone}
              </a>
            </p>
            <p className="mt-4 text-sm">
              <a
                href={site.lcifUrl}
                className="font-medium text-primary underline-offset-4 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Lions Clubs International &amp; LCIF
              </a>
            </p>
          </div>
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
          </div>
        </div>
      </Container>
    </footer>
  );
}
