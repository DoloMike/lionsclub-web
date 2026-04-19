import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { env, isStripeConfigured } from "@/lib/env";
import {
  isBeforePickupDay,
  isOrderingDeadlinePassed,
} from "@/lib/fundraiser-dates";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type Body = {
  eventId?: string;
  quantity?: number;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  notes?: string;
};

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payment is not configured (set STRIPE_SECRET_KEY)." },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Payment is not configured." },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventId = String(body.eventId ?? "").trim();
  const quantity = Number(body.quantity);
  const customerEmail = String(body.customerEmail ?? "").trim().toLowerCase();
  const customerPhone = String(body.customerPhone ?? "").trim();
  const customerName = String(body.customerName ?? "").trim();
  const notes = String(body.notes ?? "").trim().slice(0, 400);

  if (!eventId || !Number.isFinite(quantity) || quantity < 1) {
    return NextResponse.json(
      { error: "Event and a valid quantity are required." },
      { status: 400 }
    );
  }

  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return NextResponse.json(
      { error: "A valid email address is required for your receipt." },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdmin();
  const { data: event, error: evErr } = await admin
    .from("fundraiser_events")
    .select(
      "id, title, order_open, event_date, orders_close_date, orders_close_at, price_cents_per_unit, max_units_per_order, inventory_units"
    )
    .eq("id", eventId)
    .maybeSingle();

  if (evErr || !event) {
    return NextResponse.json({ error: "Fundraiser not found." }, { status: 404 });
  }

  if (!event.order_open) {
    return NextResponse.json(
      { error: "Ordering is closed for this event." },
      { status: 400 }
    );
  }

  if (!event.event_date || !event.orders_close_date) {
    return NextResponse.json(
      { error: "This fundraiser is not configured for online orders yet." },
      { status: 400 }
    );
  }
  if (!isBeforePickupDay(event.event_date, env.siteTimezone)) {
    return NextResponse.json(
      { error: "The pickup date for this cook has passed." },
      { status: 400 }
    );
  }
  if (isOrderingDeadlinePassed(event, Date.now(), env.siteTimezone)) {
    return NextResponse.json(
      { error: "The order deadline for this cook has passed." },
      { status: 400 }
    );
  }

  if (quantity > event.max_units_per_order) {
    return NextResponse.json(
      {
        error: `Maximum ${event.max_units_per_order} units per order for this event.`,
      },
      { status: 400 }
    );
  }

  const unitPrice = event.price_cents_per_unit;
  const totalCents = unitPrice * quantity;

  if (event.inventory_units != null) {
    const { data: sold, error: soldErr } = await admin.rpc(
      "chicken_event_sold",
      { p_event_id: eventId }
    );
    if (soldErr) {
      return NextResponse.json(
        { error: "Inventory check failed." },
        { status: 500 }
      );
    }
    const soldUnits = typeof sold === "number" ? sold : 0;
    if (soldUnits + quantity > event.inventory_units) {
      return NextResponse.json(
        { error: "Not enough inventory left for this event." },
        { status: 400 }
      );
    }
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  const base = origin.replace(/\/$/, "");

  const idemDay = new Date().toISOString().slice(0, 10);
  // Stripe rejects an idempotency key reused with *different* params as a
  // 400 `idempotency_error`. The original key only included event/email/qty
  // /day, so a buyer who submitted, then edited their notes / name / phone
  // and clicked again would surface a 500 to the UI. Fold every variable
  // input into a content hash so "same body" still de-dupes a double-click
  // but "different body" produces a fresh key and a fresh Stripe session.
  // \x1f (US, "unit separator") is non-printable so it can't appear inside
  // the inputs themselves and create a hash collision via field re-aliasing.
  const contentHash = createHash("sha256")
    .update(
      [
        event.id,
        String(quantity),
        String(unitPrice),
        customerEmail,
        customerPhone,
        customerName,
        notes,
      ].join("\x1f")
    )
    .digest("hex")
    .slice(0, 16);
  const idempotencyKeyRaw =
    `chk_${event.id}_${customerEmail}_${quantity}_${idemDay}_${contentHash}`.replace(
      /\s+/g,
      ""
    );
  const idempotencyKey =
    idempotencyKeyRaw.length > 255
      ? idempotencyKeyRaw.slice(0, 255)
      : idempotencyKeyRaw;

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: unitPrice,
            product_data: {
              name: event.title,
              description: `${quantity} × chicken (fundraising order)`,
            },
          },
          quantity,
        },
      ],
      customer_email: customerEmail,
      // Belt-and-suspenders alongside the Stripe Dashboard "Successful payments"
      // toggle: setting receipt_email on the underlying PaymentIntent makes the
      // receipt request explicit per-session, so a buyer still gets emailed even
      // if the account-level toggle is ever flipped off or a different account
      // is wired up later.
      payment_intent_data: {
        receipt_email: customerEmail,
      },
      metadata: {
        event_id: event.id,
        quantity: String(quantity),
        unit_price_cents: String(unitPrice),
        total_cents: String(totalCents),
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_name: customerName,
        notes,
      },
      success_url: `${base}/fundraising/order/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/fundraising/order?canceled=1`,
    },
    { idempotencyKey }
  );

  if (!session.url) {
    return NextResponse.json(
      { error: "Could not start checkout session." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
