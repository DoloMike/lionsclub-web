import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { FundraisingTrustCallout } from "@/components/fundraising/FundraisingTrustCallout";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import { formatInstantInTimezone } from "@/lib/datetime";
import type { FundraiserEventRow } from "@/lib/data/fundraiser";
import { getFundraiserEventsForMarketingPage } from "@/lib/data/fundraiser";
import { FUNDRAISER_INSTANT_DISPLAY_TIMEZONE } from "@/lib/fundraiser-dates";
import { googleMapsSearchUrl } from "@/lib/maps-links";

export const metadata: Metadata = {
  title: "Fundraising",
  description:
    "Chicken cook and other fundraisers—ordering, pickup, and payment information.",
  alternates: { canonical: "/fundraising" },
};

function formatDate(ymd: string | null): string | null {
  if (!ymd) return null;
  const d = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function orderByLabel(ev: FundraiserEventRow): string | null {
  if (ev.orders_close_at) {
    return (
      formatInstantInTimezone(
        ev.orders_close_at,
        FUNDRAISER_INSTANT_DISPLAY_TIMEZONE
      ) ?? formatDate(ev.orders_close_date)
    );
  }
  return formatDate(ev.orders_close_date);
}

function pickupLabel(ev: FundraiserEventRow): string | null {
  if (ev.pickup_starts_at) {
    return (
      formatInstantInTimezone(
        ev.pickup_starts_at,
        FUNDRAISER_INSTANT_DISPLAY_TIMEZONE
      ) ?? formatDate(ev.event_date)
    );
  }
  return formatDate(ev.event_date);
}

function PickupLocationAnchor({ label }: { label: string }) {
  const href = googleMapsSearchUrl(label);
  if (!href) return <>{label}</>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline-offset-4 hover:underline"
    >
      {label}
    </a>
  );
}

export default async function FundraisingPage() {
  const { acceptingOrders, closedBeforePickup } =
    await getFundraiserEventsForMarketingPage();

  return (
    <>
      <PageHeader
        title="Fundraising"
        description="Our chicken cooks are community traditions, held a few times a year. When ordering is open, you’ll see a banner on the site and can pay online."
      />
      <div className="border-b border-border bg-section-warm">
        <Container className="py-8 sm:py-10">
          <FundraisingTrustCallout variant="marketing" />
        </Container>
      </div>
      <Prose>
        <h2>Chicken Cooks</h2>
        {acceptingOrders.length > 0 ? (
          <>
            <h3 className="!mt-6 text-base font-semibold text-foreground">
              Taking orders now
            </h3>
            <ul className="not-prose my-4 list-none space-y-4 border-l-2 border-primary/30 pl-4">
              {acceptingOrders.map((ev) => {
                const pickup = pickupLabel(ev);
                const due = orderByLabel(ev);
                return (
                  <li key={ev.id}>
                    <p className="font-semibold text-foreground">{ev.title}</p>
                    {due ? (
                      <p className="text-sm text-muted-foreground">
                        <strong>Order by:</strong> {due}
                      </p>
                    ) : null}
                    {pickup ? (
                      <p className="text-sm text-muted-foreground">
                        <strong>Pickup:</strong> {pickup}
                      </p>
                    ) : null}
                    {ev.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {ev.description}
                      </p>
                    ) : null}
                    {ev.pickup_location ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        <strong>Pickup location:</strong>{" "}
                        <PickupLocationAnchor label={ev.pickup_location} />
                      </p>
                    ) : null}
                    <p className="mt-2">
                      <Link
                        href="/fundraising/order"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Order chickens for this cook
                      </Link>
                    </p>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        {closedBeforePickup.length > 0 ? (
          <>
            <h3 className="!mt-8 text-base font-semibold text-foreground">
              Ordering closed — pickup coming up
            </h3>
            <ul className="not-prose my-4 list-none space-y-3 border-l-2 border-border pl-4">
              {closedBeforePickup.map((ev) => {
                const pickup = pickupLabel(ev);
                const due = orderByLabel(ev);
                return (
                  <li key={ev.id}>
                    <p className="font-semibold text-foreground">{ev.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Online orders closed
                      {due ? ` after ${due}` : ""}.{" "}
                      {pickup ? (
                        <>
                          Pickup is <strong>{pickup}</strong>
                          {ev.pickup_location ? (
                            <>
                              {" "}
                              — <PickupLocationAnchor label={ev.pickup_location} />
                              .
                            </>
                          ) : (
                            "."
                          )}
                        </>
                      ) : null}
                    </p>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        {acceptingOrders.length === 0 && closedBeforePickup.length === 0 ? (
          <div className="not-prose mt-4">
            <EmptyState
              title="No chicken cooks scheduled right now"
              description="Watch this page or the site banner for the next round — we typically run a few cooks per year."
              actions={
                <>
                  <ButtonLink href="/contact">Contact the club</ButtonLink>
                  <ButtonLink href="/membership" variant="secondary">
                    Membership Info
                  </ButtonLink>
                </>
              }
            />
          </div>
        ) : null}

        <p>
          <Link
            href="/fundraising/order"
            className="font-medium text-primary"
          >
            Order chicken
          </Link>{" "}
          — checkout collects payment; the club records your order only after it
          succeeds. For other arrangements,{" "}
          <Link href="/contact">contact the club</Link>.
        </p>
        <h2>Other Campaigns</h2>
        <p>
          Additional fundraisers will be listed here with clear instructions
          and any terms of sale.
        </p>
      </Prose>
    </>
  );
}
