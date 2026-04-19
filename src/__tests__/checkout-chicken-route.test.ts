import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sessionsCreate = vi.fn();
const supabaseRpc = vi.fn();
const supabaseFrom = vi.fn();

vi.mock("@/lib/env", () => ({
  env: {
    isDevelopment: false,
    stripe: { secretKey: "sk_test", webhookSecret: "whsec_test" },
    siteTimezone: "America/Kentucky/Louisville",
  },
  isStripeConfigured: vi.fn(() => true),
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: (...args: unknown[]) => sessionsCreate(...args),
      },
    },
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    from: (...args: unknown[]) => supabaseFrom(...args),
    rpc: (...args: unknown[]) => supabaseRpc(...args),
  }),
}));

vi.mock("@/lib/fundraiser-dates", () => ({
  isBeforePickupDay: vi.fn(() => true),
  isOrderingDeadlinePassed: vi.fn(() => false),
}));

import { POST } from "@/app/api/checkout/chicken/route";

function mockEventLookup(event: Record<string, unknown> | null) {
  supabaseFrom.mockImplementationOnce(() => ({
    select: () => ({
      eq: () => ({
        maybeSingle: () => Promise.resolve({ data: event, error: null }),
      }),
    }),
  }));
}

function buildRequest(body: unknown): Request {
  return new Request("https://example.com/api/checkout/chicken", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      origin: "https://example.com",
    },
  });
}

describe("POST /api/checkout/chicken", () => {
  beforeEach(() => {
    sessionsCreate.mockReset();
    supabaseFrom.mockReset();
    supabaseRpc.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("forwards receipt_email on payment_intent_data so Stripe emails the buyer", async () => {
    mockEventLookup({
      id: "evt_1",
      title: "Spring 2026 Chicken Cook",
      order_open: true,
      event_date: "2099-05-01",
      orders_close_date: "2099-04-25",
      orders_close_at: null,
      price_cents_per_unit: 1300,
      max_units_per_order: 10,
      inventory_units: null,
    });
    sessionsCreate.mockResolvedValueOnce({ url: "https://stripe.example/session" });

    const res = await POST(
      buildRequest({
        eventId: "evt_1",
        quantity: 2,
        customerEmail: "Buyer@Example.com",
        customerName: "Buyer",
      })
    );

    expect(res.status).toBe(200);
    expect(sessionsCreate).toHaveBeenCalledTimes(1);
    const [params, options] = sessionsCreate.mock.calls[0] as [
      Record<string, unknown>,
      { idempotencyKey?: string }
    ];
    expect(params.customer_email).toBe("buyer@example.com");
    expect(params.payment_intent_data).toEqual({
      receipt_email: "buyer@example.com",
    });
    expect(options.idempotencyKey).toMatch(/^chk_evt_1_buyer@example\.com_2_/);
  });

  it("rejects requests without a valid email so we never lose receipt deliverability", async () => {
    const res = await POST(
      buildRequest({ eventId: "evt_1", quantity: 1, customerEmail: "not-an-email" })
    );
    expect(res.status).toBe(400);
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("derives the idempotency key from request content so edited form fields don't 500", async () => {
    // Two requests, identical event/email/qty/day but different `notes` —
    // historically these collided on the same Stripe idempotency key and
    // returned `idempotency_error` 500s. The key must now diverge.
    function eventStub() {
      return {
        id: "evt_1",
        title: "Spring 2026 Chicken Cook",
        order_open: true,
        event_date: "2099-05-01",
        orders_close_date: "2099-04-25",
        orders_close_at: null,
        price_cents_per_unit: 1300,
        max_units_per_order: 10,
        inventory_units: null,
      };
    }

    mockEventLookup(eventStub());
    sessionsCreate.mockResolvedValueOnce({ url: "https://stripe.example/a" });
    await POST(
      buildRequest({
        eventId: "evt_1",
        quantity: 1,
        customerEmail: "buyer@example.com",
        notes: "first try",
      })
    );

    mockEventLookup(eventStub());
    sessionsCreate.mockResolvedValueOnce({ url: "https://stripe.example/b" });
    await POST(
      buildRequest({
        eventId: "evt_1",
        quantity: 1,
        customerEmail: "buyer@example.com",
        notes: "edited after a typo",
      })
    );

    expect(sessionsCreate).toHaveBeenCalledTimes(2);
    const firstKey = (sessionsCreate.mock.calls[0]?.[1] as { idempotencyKey: string }).idempotencyKey;
    const secondKey = (sessionsCreate.mock.calls[1]?.[1] as { idempotencyKey: string }).idempotencyKey;
    expect(firstKey).not.toBe(secondKey);
    // Same shape so historical greps in logs still work.
    expect(firstKey).toMatch(/^chk_evt_1_buyer@example\.com_1_/);
    expect(secondKey).toMatch(/^chk_evt_1_buyer@example\.com_1_/);
  });

  it("returns the same idempotency key when the request body is identical (true double-click)", async () => {
    function eventStub() {
      return {
        id: "evt_1",
        title: "Spring 2026 Chicken Cook",
        order_open: true,
        event_date: "2099-05-01",
        orders_close_date: "2099-04-25",
        orders_close_at: null,
        price_cents_per_unit: 1300,
        max_units_per_order: 10,
        inventory_units: null,
      };
    }
    const body = {
      eventId: "evt_1",
      quantity: 2,
      customerEmail: "buyer@example.com",
      customerName: "Buyer",
      customerPhone: "555-555-0100",
      notes: "leave at front door",
    };

    mockEventLookup(eventStub());
    sessionsCreate.mockResolvedValueOnce({ url: "https://stripe.example/a" });
    await POST(buildRequest(body));

    mockEventLookup(eventStub());
    sessionsCreate.mockResolvedValueOnce({ url: "https://stripe.example/b" });
    await POST(buildRequest(body));

    const firstKey = (sessionsCreate.mock.calls[0]?.[1] as { idempotencyKey: string }).idempotencyKey;
    const secondKey = (sessionsCreate.mock.calls[1]?.[1] as { idempotencyKey: string }).idempotencyKey;
    expect(firstKey).toBe(secondKey);
  });
});
