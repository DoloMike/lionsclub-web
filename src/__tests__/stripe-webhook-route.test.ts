import { afterEach, describe, expect, it, vi } from "vitest";

const constructEvent = vi.fn();
const recordPaidChickenOrder = vi.fn();

vi.mock("@/lib/env", () => ({
  env: {
    isDevelopment: false,
    stripe: { secretKey: "sk_test", webhookSecret: "whsec_test" },
  },
  isStripeWebhookConfigured: vi.fn(() => true),
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: { constructEvent: (...args: unknown[]) => constructEvent(...args) },
  }),
}));

vi.mock("@/lib/data/record-paid-chicken-order", () => ({
  recordPaidChickenOrder: (...args: unknown[]) =>
    recordPaidChickenOrder(...args),
}));

import { POST } from "@/app/api/webhooks/stripe/route";
import { isStripeWebhookConfigured } from "@/lib/env";

function buildRequest(
  body: string,
  headers: Record<string, string> = {}
): Request {
  return new Request("https://example.com/api/webhooks/stripe", {
    method: "POST",
    body,
    headers: { "content-type": "application/json", ...headers },
  });
}

describe("POST /api/webhooks/stripe", () => {
  afterEach(() => {
    constructEvent.mockReset();
    recordPaidChickenOrder.mockReset();
  });

  it("503s when webhook is not configured", async () => {
    vi.mocked(isStripeWebhookConfigured).mockReturnValueOnce(false);
    const res = await POST(buildRequest("{}"));
    expect(res.status).toBe(503);
  });

  it("400s when stripe-signature header is missing", async () => {
    const res = await POST(buildRequest("{}"));
    expect(res.status).toBe(400);
  });

  it("400s when signature verification fails", async () => {
    constructEvent.mockImplementationOnce(() => {
      throw new Error("bad sig");
    });
    const res = await POST(
      buildRequest("{}", { "stripe-signature": "t=1,v1=abc" })
    );
    expect(res.status).toBe(400);
  });

  it("records paid order on checkout.session.completed", async () => {
    constructEvent.mockReturnValueOnce({
      type: "checkout.session.completed",
      data: { object: { id: "cs_1", payment_status: "paid" } },
    });
    recordPaidChickenOrder.mockResolvedValueOnce({ status: "inserted" });
    const res = await POST(
      buildRequest("{}", { "stripe-signature": "t=1,v1=abc" })
    );
    expect(res.status).toBe(200);
    expect(recordPaidChickenOrder).toHaveBeenCalledWith(
      expect.objectContaining({ id: "cs_1" })
    );
  });

  it("ignores unrelated events", async () => {
    constructEvent.mockReturnValueOnce({
      type: "customer.created",
      data: { object: {} },
    });
    const res = await POST(
      buildRequest("{}", { "stripe-signature": "t=1,v1=abc" })
    );
    expect(res.status).toBe(200);
    expect(recordPaidChickenOrder).not.toHaveBeenCalled();
  });

  it("500s when recording fails so Stripe retries", async () => {
    constructEvent.mockReturnValueOnce({
      type: "checkout.session.completed",
      data: { object: { id: "cs_2", payment_status: "paid" } },
    });
    recordPaidChickenOrder.mockResolvedValueOnce({
      status: "error",
      error: "db down",
    });
    const res = await POST(
      buildRequest("{}", { "stripe-signature": "t=1,v1=abc" })
    );
    expect(res.status).toBe(500);
  });
});
