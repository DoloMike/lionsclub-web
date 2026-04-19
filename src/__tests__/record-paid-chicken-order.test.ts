import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

const maybeSingle = vi.fn();
const insert = vi.fn();
const updateTag = vi.fn();

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
  updateTag: (...args: unknown[]) => updateTag(...args),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle }),
      }),
      insert,
    }),
  }),
}));

import { recordPaidChickenOrder } from "@/lib/data/record-paid-chicken-order";

function buildSession(
  meta: Partial<Record<string, string>> = {}
): Stripe.Checkout.Session {
  return {
    id: "cs_test_1",
    metadata: {
      event_id: "evt-1",
      quantity: "2",
      unit_price_cents: "1300",
      total_cents: "2600",
      customer_email: "buyer@example.com",
      customer_phone: "555",
      customer_name: "Buyer",
      notes: "extra crispy",
      ...meta,
    },
  } as unknown as Stripe.Checkout.Session;
}

describe("recordPaidChickenOrder", () => {
  beforeEach(() => {
    maybeSingle.mockReset();
    insert.mockReset();
    updateTag.mockReset();
  });

  afterEach(() => vi.resetAllMocks());

  it("returns missing_metadata when required fields are blank", async () => {
    const result = await recordPaidChickenOrder(
      buildSession({ event_id: "" })
    );
    expect(result).toEqual({ status: "missing_metadata" });
    expect(insert).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("returns already_recorded if a row exists", async () => {
    maybeSingle.mockResolvedValueOnce({ data: { id: "row1" } });
    const result = await recordPaidChickenOrder(buildSession());
    expect(result).toEqual({ status: "already_recorded" });
    expect(insert).not.toHaveBeenCalled();
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("inserts and invalidates cache when row is missing", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null });
    insert.mockResolvedValueOnce({ error: null });
    const result = await recordPaidChickenOrder(buildSession());
    expect(result).toEqual({ status: "inserted" });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_id: "evt-1",
        quantity: 2,
        unit_price_cents: 1300,
        total_cents: 2600,
        customer_email: "buyer@example.com",
        status: "paid",
        stripe_checkout_session_id: "cs_test_1",
      })
    );
    expect(updateTag).toHaveBeenCalledWith("chicken-orders");
  });

  it("treats unique-violation race as already_recorded", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null });
    insert.mockResolvedValueOnce({ error: { code: "23505", message: "dup" } });
    const result = await recordPaidChickenOrder(buildSession());
    expect(result).toEqual({ status: "already_recorded" });
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("surfaces other insert errors", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null });
    insert.mockResolvedValueOnce({
      error: { code: "42P01", message: "no table" },
    });
    const result = await recordPaidChickenOrder(buildSession());
    expect(result).toEqual({ status: "error", error: "no table" });
    expect(updateTag).not.toHaveBeenCalled();
  });
});
