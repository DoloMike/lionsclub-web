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
});
