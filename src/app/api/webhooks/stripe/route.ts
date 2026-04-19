import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { env, isStripeWebhookConfigured } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { recordPaidChickenOrder } from "@/lib/data/record-paid-chicken-order";

/**
 * Stripe → app webhook. Source of truth for paid chicken orders.
 *
 * Why a webhook in addition to the return page:
 *   The return page only runs if the customer actually loads the success URL.
 *   If they close the tab on Stripe's confirmation screen the order would
 *   never be recorded. The webhook fires regardless and is the durable path.
 *
 * Idempotency:
 *   `chicken_orders.stripe_checkout_session_id` is a unique column. Both
 *   writers (this webhook and the return page fallback) call the shared
 *   `recordPaidChickenOrder` helper, which selects-then-inserts and treats
 *   23505 (unique violation) as success.
 *
 * Cache invalidation:
 *   The helper calls `updateTag("chicken-orders")` after a real insert so the
 *   buyer's next request stops seeing the just-paid event in the banner.
 */
export const dynamic = "force-dynamic";
// Use Node runtime — Stripe.webhooks.constructEvent uses the Node crypto API.
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeWebhookConfigured()) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  // constructEvent needs the *raw* body — request.text() returns it untouched.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.stripe.webhookSecret
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid") {
      const result = await recordPaidChickenOrder(session);
      if (result.status === "error") {
        // 5xx so Stripe retries with backoff.
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
