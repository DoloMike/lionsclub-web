import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isStripeConfigured } from "@/lib/env";
import { recordPaidChickenOrder } from "@/lib/data/record-paid-chicken-order";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Order confirmation",
  description:
    "Confirmation after your Lewisport Lions Club fundraiser order.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

type Outcome = "not_paid" | "verify_failed" | "success";

type EventSummary = {
  title: string;
  event_date: string | null;
  pickup_location: string | null;
  pickup_notes: string | null;
};

export default async function ChickenOrderReturnPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sessionId = sp.session_id;

  if (!isStripeConfigured() || !sessionId) {
    redirect("/fundraising/order");
  }

  const stripe = getStripe();
  if (!stripe) {
    redirect("/fundraising/order");
  }

  let outcome: Outcome = "success";
  let eventSummary: EventSummary | null = null;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      outcome = "not_paid";
    } else {
      // Webhook is the durable writer; this call is a fallback for the case
      // where the customer's success URL beats the webhook (or webhook is
      // unconfigured locally). The shared helper is idempotent via the
      // unique `stripe_checkout_session_id` index. Skip cache invalidation
      // here — Next 16 forbids `updateTag` during render and the webhook
      // will invalidate the tag once it lands.
      await recordPaidChickenOrder(session, { revalidate: false });

      const m = session.metadata ?? {};
      const eventId = m.event_id;
      if (eventId && typeof eventId === "string") {
        const { data: ev } = await getSupabaseAdmin()
          .from("fundraiser_events")
          .select("title, event_date, pickup_location, pickup_notes")
          .eq("id", eventId)
          .maybeSingle();
        if (ev) eventSummary = ev as EventSummary;
      }
    }
  } catch (err) {
    // Without this log, "verify_failed" is a black hole — both webhook
    // failures and Supabase/Stripe errors look identical to the user.
    console.error(
      "[chicken-order/return] failed to verify checkout session",
      { sessionId },
      err,
    );
    outcome = "verify_failed";
  }

  if (outcome === "not_paid") {
    return (
      <div className="border-b border-border bg-muted/20 py-16">
        <Container>
          <h1 className="text-xl font-semibold text-foreground">
            Payment not completed
          </h1>
          <p className="mt-2 text-muted-foreground">
            We didn&apos;t receive a completed payment for this session.
          </p>
          <Link
            href="/fundraising/order"
            className="mt-6 inline-block text-primary underline-offset-4 hover:underline"
          >
            Back to order
          </Link>
        </Container>
      </div>
    );
  }

  if (outcome === "verify_failed") {
    return (
      <div className="border-b border-border bg-muted/20 py-16">
        <Container>
          <h1 className="text-xl font-semibold text-foreground">
            Could not verify payment
          </h1>
          <p className="mt-2 text-muted-foreground">
            If you were charged, contact the club with your email receipt:{" "}
            <a
              href={`mailto:${site.contact.email}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {site.contact.email}
            </a>
            .
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-block text-primary underline-offset-4 hover:underline"
          >
            Contact
          </Link>
        </Container>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-gradient-to-b from-primary/10 to-muted/20 py-16">
      <Container>
        <Eyebrow tone="primary">Payment received</Eyebrow>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Thank you — your order is confirmed
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          We recorded your chicken cook order. Save the email receipt from
          Stripe; the chapter may also follow up with pickup reminders.
        </p>

        {eventSummary ? (
          <Card padding="md" className="mt-8 max-w-lg">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Pickup summary
            </h2>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {eventSummary.title}
            </p>
            {eventSummary.event_date ? (
              <p className="mt-2 text-sm text-muted-foreground">
                <strong className="text-foreground">Cook / pickup day:</strong>{" "}
                {eventSummary.event_date}
              </p>
            ) : null}
            {eventSummary.pickup_location ? (
              <p className="mt-2 text-sm text-muted-foreground">
                <strong className="text-foreground">Where:</strong>{" "}
                {eventSummary.pickup_location}
              </p>
            ) : null}
            {eventSummary.pickup_notes ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {eventSummary.pickup_notes}
              </p>
            ) : null}
          </Card>
        ) : null}

        <ul className="mt-8 max-w-xl list-inside list-disc space-y-2 text-sm text-muted-foreground">
          <li>
            Bring your confirmation email (or show it on your phone) at pickup.
          </li>
          <li>
            Need help?{" "}
            <a
              href={`mailto:${site.contact.email}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {site.contact.email}
            </a>
          </li>
        </ul>

        <div className="mt-10 flex flex-wrap gap-4">
          <ButtonLink href="/fundraising" size="lg">
            Fundraising info
          </ButtonLink>
          <ButtonLink href="/" variant="secondary" size="lg">
            Home
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
