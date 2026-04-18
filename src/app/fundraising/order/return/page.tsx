import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { isStripeConfigured } from "@/lib/env";
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
      const admin = getSupabaseAdmin();
      const { data: existing } = await admin
        .from("chicken_orders")
        .select("id")
        .eq("stripe_checkout_session_id", sessionId)
        .maybeSingle();

      if (!existing) {
        const m = session.metadata ?? {};
        const eventId = m.event_id;
        const quantity = parseInt(m.quantity ?? "0", 10);
        const unitPrice = parseInt(m.unit_price_cents ?? "0", 10);
        const totalCents = parseInt(m.total_cents ?? "0", 10);

        if (
          eventId &&
          quantity > 0 &&
          unitPrice > 0 &&
          totalCents > 0 &&
          m.customer_email
        ) {
          await admin.from("chicken_orders").insert({
            event_id: eventId,
            quantity,
            unit_price_cents: unitPrice,
            total_cents: totalCents,
            customer_email: m.customer_email,
            customer_phone: m.customer_phone || null,
            customer_name: m.customer_name || null,
            notes: m.notes || null,
            user_id: null,
            status: "paid",
            stripe_checkout_session_id: sessionId,
          });
        }
      }

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
  } catch {
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
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">
          Payment received
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Thank you — your order is confirmed
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          We recorded your chicken cook order. Save the email receipt from
          Stripe; the chapter may also follow up with pickup reminders.
        </p>

        {eventSummary ? (
          <div className="mt-8 max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm">
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
          </div>
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
          <Link
            href="/fundraising"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Fundraising info
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-card-foreground transition hover:bg-muted"
          >
            Home
          </Link>
        </div>
      </Container>
    </div>
  );
}
