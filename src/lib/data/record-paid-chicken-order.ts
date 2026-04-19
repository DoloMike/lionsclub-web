import "server-only";

import { updateTag } from "next/cache";
import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type RecordPaidOrderResult =
  | { status: "inserted" }
  | { status: "already_recorded" }
  | { status: "missing_metadata" }
  | { status: "error"; error: string };

/**
 * Insert a paid chicken_orders row from a Stripe checkout session, idempotent
 * via the unique constraint on `stripe_checkout_session_id`. Called from both
 * the Stripe webhook (source of truth) and the return page (fallback if the
 * webhook hasn't landed or isn't configured locally).
 *
 * `revalidate` controls whether to invalidate the `chicken-orders` cache tag.
 * The webhook (a Route Handler) sets it to true. The return page (a Server
 * Component) sets it to false: Next 16 throws `"updateTag … used during
 * render which is unsupported"` from render contexts, and the webhook will
 * invalidate the tag itself when it lands.
 */
export async function recordPaidChickenOrder(
  session: Stripe.Checkout.Session,
  options: { revalidate?: boolean } = {}
): Promise<RecordPaidOrderResult> {
  const { revalidate = true } = options;
  const m = session.metadata ?? {};
  const eventId = typeof m.event_id === "string" ? m.event_id : "";
  const quantity = parseInt(m.quantity ?? "0", 10);
  const unitPrice = parseInt(m.unit_price_cents ?? "0", 10);
  const totalCents = parseInt(m.total_cents ?? "0", 10);
  const customerEmail =
    typeof m.customer_email === "string" ? m.customer_email : "";

  if (
    !eventId ||
    quantity <= 0 ||
    unitPrice <= 0 ||
    totalCents <= 0 ||
    !customerEmail
  ) {
    return { status: "missing_metadata" };
  }

  const admin = getSupabaseAdmin();

  const { data: existing } = await admin
    .from("chicken_orders")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (existing) {
    return { status: "already_recorded" };
  }

  const { error } = await admin.from("chicken_orders").insert({
    event_id: eventId,
    quantity,
    unit_price_cents: unitPrice,
    total_cents: totalCents,
    customer_email: customerEmail,
    customer_phone: m.customer_phone || null,
    customer_name: m.customer_name || null,
    notes: m.notes || null,
    user_id: null,
    status: "paid",
    stripe_checkout_session_id: session.id,
  });

  if (error) {
    // Race with the webhook: another writer beat us through the unique index.
    // Treat as success so the user-facing return page still shows confirmed.
    if (error.code === "23505") {
      return { status: "already_recorded" };
    }
    return { status: "error", error: error.message };
  }

  if (revalidate) {
    updateTag("chicken-orders");
  }
  return { status: "inserted" };
}
