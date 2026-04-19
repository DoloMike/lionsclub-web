"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { FundraisingTrustCallout } from "@/components/fundraising/FundraisingTrustCallout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { fieldClassName } from "@/components/ui/field";
import type { FundraiserEventRow } from "@/lib/data/fundraiser";
import { formatInstantInTimezone } from "@/lib/datetime";
import { FUNDRAISER_INSTANT_DISPLAY_TIMEZONE } from "@/lib/fundraiser-dates";
import { googleMapsSearchUrl } from "@/lib/maps-links";

function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatLongDate(ymd: string | null): string | null {
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

function orderByLabel(e: FundraiserEventRow): string | null {
  if (e.orders_close_at) {
    return (
      formatInstantInTimezone(
        e.orders_close_at,
        FUNDRAISER_INSTANT_DISPLAY_TIMEZONE
      ) ?? formatLongDate(e.orders_close_date)
    );
  }
  return formatLongDate(e.orders_close_date);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(s: string): boolean {
  const t = s.trim();
  return t.length > 0 && EMAIL_RE.test(t);
}

function pickupLabel(e: FundraiserEventRow): string | null {
  if (e.pickup_starts_at) {
    return (
      formatInstantInTimezone(
        e.pickup_starts_at,
        FUNDRAISER_INSTANT_DISPLAY_TIMEZONE
      ) ?? formatLongDate(e.event_date)
    );
  }
  return formatLongDate(e.event_date);
}

export function ChickenOrderClient({
  events,
  stripeReady,
}: {
  events: FundraiserEventRow[];
  stripeReady: boolean;
}) {
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [quantityTouched, setQuantityTouched] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!error) return;
    errorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [error]);

  const selected = useMemo(
    () => events.find((e) => e.id === eventId),
    [events, eventId]
  );

  const selectedPickupMapsHref = useMemo(() => {
    if (!selected?.pickup_location) return "";
    return googleMapsSearchUrl(selected.pickup_location);
  }, [selected]);

  const lineTotal =
    selected != null ? selected.price_cents_per_unit * quantity : 0;

  const emailInvalid =
    customerEmail.trim().length > 0 && !isValidEmail(customerEmail);
  const showEmailError = emailTouched && emailInvalid;
  const maxQ = selected?.max_units_per_order ?? 99;
  const quantityInvalid =
    quantity < 1 || quantity > maxQ || !Number.isFinite(quantity);
  const showQuantityError = quantityTouched && quantityInvalid;

  async function handlePay() {
    setError(null);
    setEmailTouched(true);
    setQuantityTouched(true);
    if (!selected) {
      setError("Choose an active fundraiser.");
      return;
    }
    if (!customerEmail.trim()) {
      setError("Email is required for your receipt.");
      return;
    }
    if (!isValidEmail(customerEmail)) {
      setError("Enter a valid email address for your receipt.");
      return;
    }
    if (quantityInvalid) {
      setError(
        `Choose a quantity between 1 and ${maxQ} for this fundraiser.`
      );
      return;
    }
    if (!stripeReady) {
      setError(
        "Online payment is not configured yet (missing STRIPE_SECRET_KEY)."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout/chicken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selected.id,
          quantity,
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          customerName: customerName.trim(),
          notes: notes.trim(),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Checkout failed.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("No checkout URL returned.");
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  if (events.length === 0) {
    return (
      <div className="bg-muted/30 pb-16 pt-6 sm:pt-10">
        <Container>
          <div className="mx-auto max-w-lg">
            <BackToFundraisingLink />
            <p className="mt-8 text-muted-foreground">
              No fundraisers are open for online ordering right now.{" "}
              <Link
                href="/contact"
                className="text-primary underline-offset-4 hover:underline"
              >
                Contact the club
              </Link>{" "}
              or check back later.
            </p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 pb-16 pt-6 sm:pt-10">
      <Container>
        <div className="mx-auto max-w-lg">
          <BackToFundraisingLink />
          <Card
            elevation="raised"
            ring
            className="mt-6 space-y-6"
            role="region"
            aria-labelledby="chicken-order-heading"
          >
            <div className="border-b border-border pb-4">
              <h2
                id="chicken-order-heading"
                className="text-lg font-semibold text-foreground"
              >
                Your order
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose quantities and add your details, then continue to secure
                checkout.
              </p>
            </div>

            <FundraisingTrustCallout variant="checkout" />

        <div>
          <label className="block text-sm font-medium text-foreground">
            Fundraiser
          </label>
          <select
            value={eventId}
            onChange={(e) => {
              const newId = e.target.value;
              setEventId(newId);
              const ev = events.find((x) => x.id === newId);
              if (ev) {
                setQuantity((q) =>
                  Math.min(ev.max_units_per_order, Math.max(1, q))
                );
              }
            }}
            disabled={loading}
            className={fieldClassName("mt-1")}
          >
            {/* Title only — long deadline strings here force iOS to widen the
                native select box past the viewport, breaking mobile layout.
                "Order by" + pickup details render below once a value is picked. */}
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        {selected ? (
          <>
            {selected.description ? (
              <p className="text-sm text-muted-foreground">{selected.description}</p>
            ) : null}
            {orderByLabel(selected) ? (
              <p className="text-sm text-muted-foreground">
                <strong>Order by:</strong> {orderByLabel(selected)}
              </p>
            ) : null}
            {pickupLabel(selected) ? (
              <p className="text-sm text-muted-foreground">
                <strong>Pickup:</strong> {pickupLabel(selected)}
              </p>
            ) : null}
            {selected.pickup_location ? (
              <p className="text-sm text-muted-foreground">
                <strong>Pickup location:</strong>{" "}
                {selectedPickupMapsHref ? (
                  <a
                    href={selectedPickupMapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {selected.pickup_location}
                  </a>
                ) : (
                  selected.pickup_location
                )}
              </p>
            ) : null}
            {selected.pickup_notes ? (
              <p className="text-sm text-muted-foreground">{selected.pickup_notes}</p>
            ) : null}
          </>
        ) : null}

        <div>
          <label className="block text-sm font-medium text-foreground">
            Quantity
          </label>
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            onBlur={() => setQuantityTouched(true)}
            disabled={loading}
            aria-invalid={showQuantityError}
            aria-describedby={
              showQuantityError ? "quantity-error" : undefined
            }
            className={fieldClassName("mt-1 tabular-nums")}
          >
            {Array.from({ length: maxQ }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {showQuantityError ? (
            <p
              id="quantity-error"
              className="mt-1 text-xs text-destructive"
              role="alert"
            >
              Choose a quantity from 1 to {maxQ}.
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              {selected
                ? `${formatUsd(selected.price_cents_per_unit)} each · max ${selected.max_units_per_order} per order`
                : null}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">
            Name (optional)
          </label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={loading}
            className={fieldClassName("mt-1")}
            autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">
            Email (required)
          </label>
          <input
            type="email"
            required
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            disabled={loading}
            aria-invalid={showEmailError}
            aria-describedby={showEmailError ? "email-error" : undefined}
            className={fieldClassName("mt-1")}
            autoComplete="email"
          />
          {showEmailError ? (
            <p id="email-error" className="mt-1 text-xs text-destructive" role="alert">
              Enter a valid email address.
            </p>
          ) : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">
            Phone (optional)
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            disabled={loading}
            className={fieldClassName("mt-1")}
            autoComplete="tel"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            disabled={loading}
            className={fieldClassName("mt-1")}
          />
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">
            Estimated total:{" "}
            <span className="text-lg tabular-nums">{formatUsd(lineTotal)}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Total is confirmed at checkout. Your order is recorded only after
            payment completes.
          </p>
        </div>

        {error ? (
          <p
            ref={errorRef}
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <Button
          onClick={() => void handlePay()}
          disabled={!stripeReady || !selected}
          pending={loading}
          pendingLabel="Redirecting to checkout…"
          size="lg"
          className="w-full"
        >
          {stripeReady ? "Continue to payment" : "Payment not configured"}
        </Button>

        {!stripeReady ? (
          <p className="text-xs text-muted-foreground">
            Set <code className="font-mono">STRIPE_SECRET_KEY</code> in{" "}
            <code className="font-mono">.env.local</code> to enable Stripe
            Checkout. Until then, use{" "}
            <Link href="/contact" className="text-primary hover:underline">
              contact
            </Link>{" "}
            to order by email.
          </p>
        ) : null}
          </Card>
        </div>
      </Container>
    </div>
  );
}

function BackToFundraisingLink() {
  return (
    <Link
      href="/fundraising"
      className="inline-flex text-sm font-medium text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
    >
      ← Back to fundraising
    </Link>
  );
}
